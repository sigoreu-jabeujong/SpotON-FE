import type { ApiMeta, ApiResponse } from '../types/api'
import { getMockResponse } from './mocks'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
/** API 경로 접두사 (CLAUDE.md: /api/v1/...) */
export const API_PREFIX = '/api/v1'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const TIMEOUT_MS = 15000

/** 서버 오류·네트워크 오류를 화면에서 한 가지 방식으로 다루기 위한 에러 */
export class ApiRequestError extends Error {
  readonly code: string
  readonly status: number | null

  constructor(code: string, message: string, status: number | null) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
    this.status = status
  }
}

export type ApiResult<T> = { data: T; meta: ApiMeta | null }

type QueryValue = string | number | boolean | null | undefined | readonly (string | number)[]

function toQueryString(params?: Record<string, QueryValue>): string {
  if (!params) return ''
  const p = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue
    p.set(key, Array.isArray(value) ? value.join(',') : String(value))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  if (USE_MOCK) {
    const mock = getMockResponse<T>(path)
    if (mock) return unwrap(mock, 200)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${BASE_URL}${API_PREFIX}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      signal: controller.signal,
    })
    const body = (await res.json().catch(() => null)) as ApiResponse<T> | null
    if (!body)
      throw new ApiRequestError('INVALID_RESPONSE', '응답 형식이 올바르지 않아요', res.status)
    return unwrap(body, res.status)
  } catch (e) {
    if (e instanceof ApiRequestError) throw e
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new ApiRequestError('TIMEOUT', '응답이 너무 오래 걸려요', null)
    }
    throw new ApiRequestError('NETWORK_ERROR', '서버에 연결할 수 없어요', null)
  } finally {
    clearTimeout(timer)
  }
}

function unwrap<T>(body: ApiResponse<T>, status: number): ApiResult<T> {
  if (body.error || body.data === null) {
    throw new ApiRequestError(
      body.error?.code ?? 'EMPTY_DATA',
      body.error?.message ?? '데이터가 없어요',
      status,
    )
  }
  return { data: body.data, meta: body.meta }
}

export function apiGet<T>(path: string, params?: Record<string, QueryValue>) {
  return request<T>(`${path}${toQueryString(params)}`)
}

export function apiPost<T>(path: string, body: unknown) {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}
