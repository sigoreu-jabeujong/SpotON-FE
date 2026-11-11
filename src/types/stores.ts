import type { Category, SubCategory } from '../constants/diagnosis'

/** 점포 영업 상태: 영업 중 / 폐업 / 기타(휴업 등) */
export type StoreStatus = 'open' | 'closed' | 'other'

/** 프랜차이즈: 프랜차이즈(추정) / 개인 매장 / 정보 없음 */
export type FranchiseStatus = 'franchise' | 'independent' | 'unknown'

/** 위치 일치: 같은 자리 / 같은 건물 다른 위치 / 상세 위치 미확인 */
export type LocationMatch = 'same_spot' | 'same_building' | 'unverified'

/** API sub_category 값. 음식점 4종 + 카페(DB 내부 분류 cafe) */
export type ApiSubCategory = SubCategory | 'cafe'

/* ───── GET /api/stores/history ───── */

export type StoreHistoryParams = {
  building_key: string
  floor_unit?: string | null
  /** 진단 맥락 업종 (다른 지원 업종을 걸러내는 필터 아님 — 확인 대기) */
  category?: Category | null
}

export type HistoryStore = {
  source: 'general_restaurant' | 'rest_cafe'
  license_no: string
  name: string | null
  category: Category
  sub_category: ApiSubCategory
  open_date: string | null
  close_date: string | null
  operating_months: number | null
  operating_period_status: 'fact' | 'no_data'
  operating_period_reason: OperatingPeriodReason | null
  store_status: StoreStatus
  franchise: FranchiseStatus
  floor_unit: string | null
  location_match: LocationMatch
}

export type OperatingPeriodReason =
  | 'missing_open_date'
  | 'invalid_open_date'
  | 'missing_close_date'
  | 'invalid_close_date'
  | 'missing_source_date'
  | 'invalid_date_order'
  | 'other_status'

export type StoreHistory = {
  total: number
  /** 인허가일 오름차순 */
  stores: HistoryStore[]
  /** 0건일 때 안내 문구 */
  message: string | null
}

/* ───── GET /api/stores/nearby ───── */

export type NearbyMarker = {
  license_no: string
  name: string
  sub_category: ApiSubCategory
  lat: number
  lng: number
  distance_m: number
  open_date: string
  close_date: string | null
  operating_months: number
  current_status: StoreStatus
  franchise: FranchiseStatus
  /** 신고 면적 ㎡. 정보 없으면 null */
  area_m2: number | null
}

export type NearbyStores = {
  center: { lat: number; lng: number }
  radius_m: number
  as_of: string
  count: number
  /** 좌표가 없어 제외된 점포 수 */
  excluded_no_coord: number
  markers: NearbyMarker[]
  message: string | null
}

/* ───── GET /api/stores/snapshot ───── */

export type SnapshotStore = {
  license_no: string
  name: string
  sub_category: ApiSubCategory
  lat: number
  lng: number
  open_date: string
  close_date: string | null
  operating_months: number
  current_status: StoreStatus
}

export type StoreSnapshot = {
  as_of: string
  /** N: 기준 시점 동일 업종 점포 수 */
  total_at_as_of: number
  /** A: 지금도 운영 중 */
  still_open: number
  /** B: 이후 폐업 */
  closed_since: number
  other: number
  stores: SnapshotStore[]
  summary_text: string
}
