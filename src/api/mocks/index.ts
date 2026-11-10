import type { ApiResponse } from '../../types/api'
import { geocodeMock } from './geocode'
import { marketActivityMock } from './market'
import { dataRangeMock } from './meta'
import { riskInterpretMock, riskMock } from './risk'
import { nearbyStoresMock, storeSnapshotMock } from './nearby'
import { storeHistoryMock } from './stores'
import { supportLinksMock } from './support'

/**
 * 목업 응답 등록소. VITE_USE_MOCK=true 일 때 실제 서버 대신 사용한다.
 * 경로(쿼리 제외)를 키로, 요청 쿼리·본문을 받아 { status, body }를 돌려주는 함수를 등록한다.
 */
export type MockResult = { status: number; body: ApiResponse<unknown> }
export type MockHandler = (query: URLSearchParams, body: unknown) => MockResult

/** 로딩 상태를 화면에서 확인할 수 있도록 넣는 지연 시간 */
const MOCK_DELAY_MS = 300

/** 9개 API 목업 (모두 시연용 가상 값, is_demo: true) */
const mockRoutes: Record<string, MockHandler> = {
  '/geocode': geocodeMock,
  '/stores/history': storeHistoryMock,
  '/stores/nearby': nearbyStoresMock,
  '/stores/snapshot': storeSnapshotMock,
  '/meta/data-range': dataRangeMock,
  '/market/activity': marketActivityMock,
  '/risk': riskMock,
  '/risk/interpret': riskInterpretMock,
  '/support-links': supportLinksMock,
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getMockResponse<T>(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: ApiResponse<T> } | null> {
  const [key, search = ''] = path.split('?')
  const handler = mockRoutes[key]
  if (!handler) return null
  const body: unknown = typeof init?.body === 'string' ? JSON.parse(init.body) : null
  await wait(MOCK_DELAY_MS)
  const result = handler(new URLSearchParams(search), body)
  return result as { status: number; body: ApiResponse<T> }
}
