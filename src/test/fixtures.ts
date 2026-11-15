/**
 * 테스트 전용 합성 데이터 — 실제 점포가 아니다. 필요한 필드만 바꿔 쓰도록 기본값을 둔다.
 */
import type { HistoryStore, NearbyMarker } from '../types/stores'

export function historyStore(over: Partial<HistoryStore> = {}): HistoryStore {
  return {
    source: 'general_restaurant',
    license_no: 'T-0001',
    name: '테스트 식당',
    category: 'restaurant',
    sub_category: 'korean',
    open_date: '2020-01-01',
    close_date: null,
    operating_months: 12,
    operating_period_status: 'fact',
    operating_period_reason: null,
    store_status: 'open',
    franchise: 'unknown',
    franchise_basis: null,
    franchise_reference_year: null,
    floor_unit: null,
    location_match: 'unverified',
    ...over,
  }
}

export function nearbyMarker(over: Partial<NearbyMarker> = {}): NearbyMarker {
  return {
    source: 'rest_cafe',
    license_no: 'T-0001',
    name: '테스트 카페',
    sub_category: 'cafe',
    lat: 37.5515,
    lng: 126.9139,
    distance_m: 10,
    open_date: '2020-01-01',
    close_date: null,
    operating_months: 12,
    operating_period_status: 'fact',
    operating_period_reason: null,
    current_status: 'open',
    franchise: 'unknown',
    franchise_basis: null,
    franchise_reference_year: null,
    area_m2: null,
    ...over,
  }
}
