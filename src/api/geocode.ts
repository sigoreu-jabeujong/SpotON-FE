import type { GeocodeParams, GeocodeResult } from '../types/geocode'
import { apiGet, COLD_START_TIMEOUT_MS } from './client'

/** 이 탭에서 주소 검색을 한 번이라도 끝냈는지 — 첫 검색만 잠든 서버를 기다려 준다 */
let firstSearchDone = false

/**
 * F-01 주소 → 좌표·건물 키 (GET /api/geocode).
 * 첫 검색은 무료 서버가 깨어나는 시간(최대 1분)을 기다리고, 그 뒤로는 기본 45초
 */
export async function getGeocode(params: GeocodeParams) {
  const timeoutMs = firstSearchDone ? undefined : COLD_START_TIMEOUT_MS
  try {
    return await apiGet<GeocodeResult>('/geocode', params, { timeoutMs })
  } finally {
    firstSearchDone = true
  }
}
