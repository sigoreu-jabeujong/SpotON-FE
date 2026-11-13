import type { ApiMeta, ApiResponse } from '../types/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
/** API 경로 접두사 (BE 작업계획서와 공통 기준) */
export const API_PREFIX = '/api'
/**
 * 목업 모드 — 빌드할 때 값이 정해진다. 배포 빌드(VITE_USE_MOCK=false)에서는 아래 목업 분기와
 * 동적 import('./mocks')가 통째로 빠져 목업 코드·가짜 점포 데이터가 결과물에 들어가지 않는다
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
/**
 * 목업 모드에서도 실제 서버로 부를 경로 (BE가 완성한 API부터 단계적으로 연결).
 * 형식은 mocks/index.ts의 mockRoutes 키와 같다 (예: "/geocode"). 목업 모드가 아니면 무시한다.
 */
const REAL_API_PATHS: ReadonlySet<string> = new Set(
  USE_MOCK
    ? (import.meta.env.VITE_REAL_API_PATHS ?? '')
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p !== '')
    : [],
)
if (import.meta.env.DEV && REAL_API_PATHS.size > 0) {
  console.info(`[api] 실제 서버: ${[...REAL_API_PATHS].join(', ')}`)
}
const TIMEOUT_MS = 15000

/** 서버 오류·네트워크 오류를 화면에서 한 가지 방식으로 다루기 위한 에러 */
export class ApiRequestError extends Error {
  readonly code: string
  readonly status: number | null
  /** 서버 error.detail (예: AS_OF_OUT_OF_RANGE → { min_month, max_month }) */
  readonly detail: Record<string, unknown> | null

  constructor(
    code: string,
    message: string,
    status: number | null,
    detail: Record<string, unknown> | null = null,
  ) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
    this.status = status
    this.detail = detail
  }
}

export type ApiResult<T> = { data: T; meta: ApiMeta | null }

export type QueryValue = string | number | boolean | null | undefined | readonly (string | number)[]
export type QueryParams = Record<string, QueryValue>

function toQueryString(params?: QueryParams): string {
  if (!params) return ''
  const p = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue
    if (Array.isArray(value) && value.length === 0) continue
    p.set(key, Array.isArray(value) ? value.join(',') : String(value))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

async function request<T>(
  path: string,
  init?: RequestInit,
  timeoutMs: number = TIMEOUT_MS,
): Promise<ApiResult<T>> {
  // 조건에 import.meta.env를 직접 써야 빌드 때 false로 바뀌어 이 블록이 제거된다
  if (import.meta.env.VITE_USE_MOCK === 'true' && !REAL_API_PATHS.has(path.split('?')[0])) {
    const { getMockResponse } = await import('./mocks')
    const mock = await getMockResponse<T>(path, init)
    if (mock) return unwrap(mock.body, mock.status)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
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
  if (body.error) {
    throw new ApiRequestError(
      body.error.code,
      body.error.message,
      status,
      body.error.detail ?? null,
    )
  }
  if (body.data === null || body.data === undefined) {
    throw new ApiRequestError('EMPTY_DATA', '데이터가 없어요', status)
  }
  // 오류가 아닌데 meta가 빈 객체 {}로 와도 그대로 넘긴다 (모든 meta 필드는 선택)
  return { data: body.data, meta: body.meta ?? null }
}

export function apiGet<T>(path: string, params?: QueryParams) {
  return request<T>(`${path}${toQueryString(params)}`)
}

/** @param options.timeoutMs 기본 15초. AI 해석처럼 오래 걸리는 요청만 늘린다 */
export function apiPost<T>(path: string, body: unknown, options?: { timeoutMs?: number }) {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) }, options?.timeoutMs)
}
