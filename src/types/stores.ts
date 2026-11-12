import type { Category, SubCategory } from '../constants/diagnosis'

/** 점포 영업 상태: 영업 중 / 폐업 / 기타(휴업 등) */
export type StoreStatus = 'open' | 'closed' | 'other'

/** 프랜차이즈: 프랜차이즈(추정) / 개인 매장 / 정보 없음 */
export type FranchiseStatus = 'franchise' | 'independent' | 'unknown'

/**
 * 프랜차이즈 근거 (BE docs/fe-franchise-classification-api-request.md 2장)
 * - catalog_exact_name: 기준년도 공정위 브랜드 목록과 상호가 정확히 일치 → "프랜차이즈(추정)"
 * - external_classification: 기존 외부 분류 값 (자동 일치·계약 증빙이라고 설명하지 않음)
 * - null: 분류 없음 (unknown)
 * 실제 가맹계약·직영 여부·과거(개업 당시) 소속을 확인한 값이 아니다.
 */
export type FranchiseBasis = 'catalog_exact_name' | 'external_classification'

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

/** 인허가 원천: 일반음식점 / 휴게음식점(카페 포함). 관리번호는 원천마다 따로 매겨져 겹칠 수 있다 */
export type StoreSource = 'general_restaurant' | 'rest_cafe'

/** 영업 기간 산정 상태: 계산 완료 / 미산정 (operating_months가 null이면 항상 no_data + 사유) */
export type OperatingPeriodStatus = 'fact' | 'no_data'

/** 영업 기간 미산정 사유 (BE docs/fe-store-history-api-request.md 2장) */
export type OperatingPeriodReason =
  | 'missing_open_date'
  | 'invalid_open_date'
  | 'missing_close_date'
  | 'invalid_close_date'
  | 'missing_source_date'
  | 'invalid_date_order'
  | 'other_status'

/**
 * 같은 건물의 과거 점포 한 건. 점포 식별은 source + license_no (utils/storeKey).
 * null은 키 생략이 아니라 "값 없음" — 화면은 0이나 빈칸 대신 "정보 없음"·사유를 보여준다.
 */
export type HistoryStore = {
  source: StoreSource
  license_no: string
  /** 상호. 없으면 null */
  name: string | null
  category: Category
  sub_category: ApiSubCategory
  /** 개업(인허가)일 YYYY-MM-DD. 원본 없음·무효면 null */
  open_date: string | null
  /** 폐업일. 영업 중이면 null, 폐업인데 null인 경우도 있다(사유 참고) */
  close_date: string | null
  /** 달력상 완료 개월 수. 0은 실제 0개월, null은 미산정 */
  operating_months: number | null
  operating_period_status: OperatingPeriodStatus
  operating_period_reason: OperatingPeriodReason | null
  store_status: StoreStatus
  franchise: FranchiseStatus
  franchise_basis: FranchiseBasis | null
  franchise_reference_year: number | null
  floor_unit: string | null
  location_match: LocationMatch
}

export type StoreHistory = {
  total: number
  /** 개업일 오름차순, 개업일 미확인은 마지막 (화면은 utils/history의 sortHistoryRecentFirst로 다시 정렬) */
  stores: HistoryStore[]
  /** 0건일 때 안내 문구 */
  message: string | null
}

/* ───── GET /api/stores/nearby ───── */

/**
 * 주변 점포 마커 한 건 (BE docs/fe-nearby-api-request.md 2장).
 * 식별은 source + license_no (utils/storeKey) — 지도 마커·정보창·표 선택이 모두 같은 규칙.
 * null은 키 생략이 아니라 "값 없음" — 화면은 utils/storeDisplay로 "정보 없음"·사유를 보여준다.
 */
export type NearbyMarker = {
  source: StoreSource
  license_no: string
  /** 상호. 없으면 null */
  name: string | null
  sub_category: ApiSubCategory
  lat: number
  lng: number
  /** 서버가 계산한 실제 거리(m). 표시용 반올림 값으로 다시 거르거나 정렬하지 않는다 */
  distance_m: number
  /** 시점 판단을 통과한 유효 개업일 (성공 마커에서는 null 아님) */
  open_date: string
  close_date: string | null
  /** 최신 데이터 기준 전체 영업 기간(개월). 0은 실제 0개월, null은 미산정 — 과거 시점까지로 자르지 않음 */
  operating_months: number | null
  operating_period_status: OperatingPeriodStatus
  operating_period_reason: OperatingPeriodReason | null
  /** 최신 데이터 기준 상태 (선택한 과거 시점의 상태가 아님) */
  current_status: StoreStatus
  franchise: FranchiseStatus
  franchise_basis: FranchiseBasis | null
  franchise_reference_year: number | null
  /** 신고 면적 ㎡. 정보 없음(원본 0 포함)이면 null */
  area_m2: number | null
}

export type NearbyStores = {
  center: { lat: number; lng: number }
  radius_m: number
  as_of: string
  count: number
  /**
   * 좌표가 없어 제외된 점포 수 — 반경 안 수가 아니라 서울 전체의 같은 비공간 조건 범위
   * (meta.excluded_no_coord_scope = seoul_nonspatial_cohort). 주변 점포 수와 합치지 않는다
   */
  excluded_no_coord: number
  /** BE 실제 거리 순서 그대로 */
  markers: NearbyMarker[]
  message: string | null
}

/* ───── GET /api/stores/snapshot ───── */

/** 시점 조회 점포 한 건 (BE docs/fe-store-snapshot-api-request.md 2장). nearby의 거리·가맹·면적은 없다 */
export type SnapshotStore = {
  source: StoreSource
  license_no: string
  name: string | null
  sub_category: ApiSubCategory
  lat: number
  lng: number
  open_date: string
  close_date: string | null
  operating_months: number | null
  operating_period_status: OperatingPeriodStatus
  operating_period_reason: OperatingPeriodReason | null
  current_status: StoreStatus
  /** 신규 — 시점 조회 행에도 가맹 분류·근거 (거리·면적은 없음) */
  franchise: FranchiseStatus
  franchise_basis: FranchiseBasis | null
  franchise_reference_year: number | null
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
  /** 좌표가 없어 제외된 점포 수 (서울 전체 범위 — N에 포함하지 않음) */
  excluded_no_coord: number
}
