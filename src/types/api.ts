import type { Category, FranchiseFilter, RadiusMeters, SubCategory } from '../constants/diagnosis'

/**
 * API 공통 응답 형식 { data, meta, error }
 * 기준: docs/api-contract.md (06 API 명세서 v1.1 + BE 작업계획서)
 * ⚠️ 형식을 바꾸면 SpotON-BE와 반드시 함께 맞춘다 (명세서 선행 수정 원칙)
 */

/** 공간 단위: point / radius_{n}m / market / grid / seoul */
export type ApiSpace = 'point' | 'market' | 'grid' | 'seoul' | `radius_${number}m`

/** 상태 + 사유 코드 (선택 항목 상태, 가맹 분류 상태 등) */
export type ApiStatusReason = { status: string; reason?: string | null }

/** 기간 시작·종료 YYYY-MM-DD */
export type ApiPeriod = { start: string; end: string }

/** /support-links 관할 연락처 근거 (구 지정 시에만) */
export type ApiDistrictContactSource = {
  url: string
  /** 공고일 */
  published_on: string | null
  /** BE가 연락처를 확인한 날 */
  checked_on: string | null
  page?: number | null
  table?: string | null
}

/** 데이터 버전 (화면 표시 안 함, 캐시·디버깅용) */
export type ApiDataVersion = {
  stores_batch_ids?: string[] | null
  /** 공식 지표에 쓴 기준 분기 (예: "20262"). 미사용 시 null */
  trdar_quarter?: string | null
  map_version?: string | null
  rule_version?: string | null
}

/**
 * 응답 공통 메타 정보. 서버가 빈 객체 {}를 줄 수도 있어 모든 필드를 선택·null 허용으로 둔다.
 */
export type ApiMeta = {
  /** 출처 번호 배열 (R1~R19) */
  source?: string[] | null
  /** 기준일 YYYY-MM-DD (기준 시점 월의 말일) */
  as_of?: string | null
  /** v1.2 이름 확인 대기 — 회의 자료의 effective_as_of. BE 확정 전까지 as_of를 우선 사용 */
  effective_as_of?: string | null
  space?: ApiSpace | null
  /** 표본·분모. 해당 없으면 null */
  denominator?: number | null
  /** 원천 데이터 갱신 시점 최댓값 (화면 "데이터 기준일") */
  data_updated_at?: string | null
  /** 수집 배치 완료일 (화면 "(수집 YYYY.MM.DD)") */
  collected_at?: string | null
  /** collected_at이 null인 이유 코드 (예: source_completion_time_not_recorded) */
  collection_reason?: string | null
  /** 좌표 미확보 수의 집계 범위 (nearby·snapshot: seoul_nonspatial_cohort = 서울 전체 같은 조건) */
  excluded_no_coord_scope?: string | null
  /**
   * 영업 기간 기준
   * - nearby·snapshot: latest_data = 최신 데이터 기준 전체 기간
   * - market/activity: elapsed_months_of_active_at_as_of = 기준 시점 T까지 경과 개월
   */
  operating_period_basis?: string | null

  /* ── 아래는 특정 API에서만 오는 선택 필드 (다른 API에 필수로 강제하지 않음) ── */

  /** market/activity: 폐업 기록을 포함한 활동 집계 대상 수 (현재 영업 점포 수 아님 — 화면에 쓰지 않음) */
  cohort_size?: number | null
  /** market/activity: 연도별 비교 기준 (same_month_day_ytd = 매년 1월 1일~같은 월일) */
  yearly_comparison_basis?: string | null
  /** market/activity: 연도별 비교 기간 { "2026": { start, end } } */
  yearly_periods?: Record<string, ApiPeriod> | null
  /** market/activity: 가맹 분류 상태 (지금 BE는 pending / brand_mapping_blocked) */
  franchise_classification?: ApiStatusReason | null
  /** market/activity: 요청한 선택 항목(sales·living_pop)의 상태 — 요청한 항목만 있음 */
  optional_data?: Partial<Record<'sales' | 'living_pop', ApiStatusReason>> | null
  /** market/activity: 좌표 미확보 수 (서울 전체 범위, T 이전 개업 기록 — 점포 수와 합치지 않음) */
  excluded_no_coord?: number | null
  /** support-links: 링크 목록 버전 (support-links-v2) */
  link_catalog_version?: string | null
  /** support-links: 순서 안내 — applied = 구 관할 연락처를 맨 앞에 둠 (업종 추천 아님) */
  prioritization?: (ApiStatusReason & { category_applied?: boolean | null }) | null
  /** support-links: 관할 연락처 근거 공고 (구 지정 시에만) */
  district_contact_source?: ApiDistrictContactSource | null
  /** 시연용 가상 데이터·수기 인용값이면 true */
  is_demo?: boolean | null
  data_version?: ApiDataVersion | null
}

export type ApiError = {
  code: string
  message: string
  /** 상황별 추가 정보 (예: AS_OF_OUT_OF_RANGE의 min_month·max_month). 없을 수 있다 */
  detail?: Record<string, unknown> | null
}

export type ApiResponse<T> = {
  data: T | null
  /** 오류 응답에서는 null 또는 {} 일 수 있다 */
  meta: ApiMeta | null
  error: ApiError | null
}

/* ───────── 공통 조회 파라미터 (docs/api-contract.md 1-2) ───────── */

/** 시설 규모(신고 면적 ㎡) 구간. all = 전체 */
export type ApiArea = 'all' | 'lt33' | '33to66' | '66to99' | 'gte99'

/** /stores/nearby·/stores/snapshot·/market/activity·/risk 공통 조회 파라미터 */
export type CommonQueryParams = {
  lat: number
  lng: number
  category: Category
  radius?: RadiusMeters
  /** 음식점 세부 업종(쉼표 구분). 생략 = 전체, 카페는 항상 생략 */
  sub_category?: SubCategory[]
  /** YYYY-MM. 생략 = 현재 월 */
  as_of?: string
  area?: ApiArea
  franchise?: FranchiseFilter
  include_unknown?: boolean
}
