/** /stores/history 목업 — 시연용 가상 값 (주변 점포·시점 조회는 nearby.ts) */
import type { ApiMeta } from '../../types/api'
import type { HistoryStore, StoreHistory } from '../../types/stores'
import { DEMO_META, fail, franchiseBasis, ok } from './common'
import type { MockHandler } from './index'

/** 기본 시나리오 행 — 날짜·기간이 모두 확인된 점포 (원천·기간 상태는 아래 withContract가 채움) */
type BaseHistoryStore = Omit<
  HistoryStore,
  | 'source'
  | 'operating_period_status'
  | 'operating_period_reason'
  | 'franchise_basis'
  | 'franchise_reference_year'
>

/** 실제 BE 계약 필드 추가: 카페는 휴게음식점, 음식점은 일반음식점 원천. 기간이 있으면 fact */
const withContract = (s: BaseHistoryStore): HistoryStore => ({
  source: s.category === 'cafe' ? 'rest_cafe' : 'general_restaurant',
  operating_period_status: 'fact',
  operating_period_reason: null,
  // 가맹 근거: 프랜차이즈 2곳 중 양식(서부 분류)은 기존 외부 분류, 카페는 2025년 목록명 일치 추정
  ...franchiseBasis(s.franchise, s.sub_category === 'western'),
  ...s,
})

/**
 * 이력 목업 — 시연용 가상 값. 지원 업종(카페·한식·중식·일식·양식)만.
 * same_spot / same_building / unverified, open / closed, franchise / independent / unknown 이 모두 나오게 8건.
 * API 규칙대로 개업일 오름차순.
 */
const BASE_HISTORY_STORES: BaseHistoryStore[] = [
  {
    license_no: '3130000-101-2009-00031',
    name: '○○한정식',
    category: 'restaurant',
    sub_category: 'korean',
    open_date: '2009-04-01',
    close_date: '2012-08-30',
    operating_months: 40,
    store_status: 'closed',
    franchise: 'independent',
    floor_unit: '1층',
    location_match: 'same_spot',
  },
  {
    license_no: '3130000-101-2012-00210',
    name: '△△스시',
    category: 'restaurant',
    sub_category: 'japanese',
    open_date: '2012-10-15',
    close_date: '2015-12-05',
    operating_months: 37,
    store_status: 'closed',
    franchise: 'unknown',
    floor_unit: null,
    location_match: 'unverified',
  },
  {
    license_no: '3130000-104-2016-00123',
    name: '○○커피',
    category: 'cafe',
    sub_category: 'cafe',
    open_date: '2016-03-02',
    close_date: '2018-11-30',
    operating_months: 32,
    store_status: 'closed',
    franchise: 'independent',
    floor_unit: '1층',
    location_match: 'same_spot',
  },
  {
    license_no: '3130000-101-2016-00377',
    name: '□□중화요리',
    category: 'restaurant',
    sub_category: 'chinese',
    open_date: '2016-04-20',
    close_date: '2017-11-18',
    operating_months: 18,
    store_status: 'closed',
    franchise: 'independent',
    floor_unit: '2층',
    location_match: 'same_building',
  },
  {
    // PDF 예시의 분식(snack)은 제외 업종이라 한식으로 바꿈
    license_no: '3130000-101-2019-00456',
    name: '△△한식당',
    category: 'restaurant',
    sub_category: 'korean',
    open_date: '2019-02-11',
    close_date: '2021-06-15',
    operating_months: 28,
    store_status: 'closed',
    franchise: 'unknown',
    floor_unit: null,
    location_match: 'unverified',
  },
  {
    license_no: '3130000-101-2020-00512',
    name: '◇◇파스타 ○○점',
    category: 'restaurant',
    sub_category: 'western',
    open_date: '2020-07-01',
    close_date: null,
    operating_months: 76,
    store_status: 'other',
    franchise: 'franchise',
    floor_unit: '1층 102호',
    location_match: 'same_building',
  },
  {
    license_no: '3130000-104-2022-00789',
    name: '□□카페 ○○점',
    category: 'cafe',
    sub_category: 'cafe',
    open_date: '2022-01-05',
    close_date: null,
    operating_months: 58,
    store_status: 'open',
    franchise: 'franchise',
    floor_unit: '2층',
    location_match: 'same_building',
  },
  {
    license_no: '3130000-104-2024-00901',
    name: '◎◎베이커리카페',
    category: 'cafe',
    sub_category: 'cafe',
    open_date: '2024-03-15',
    close_date: null,
    operating_months: 31,
    store_status: 'open',
    franchise: 'independent',
    floor_unit: '1층',
    location_match: 'same_spot',
  },
]

const HISTORY_STORES: HistoryStore[] = BASE_HISTORY_STORES.map(withContract)

/**
 * 결측 시나리오 (bk에 "missing") — BE 스키마가 허용하는 경계 값을 한 응답에 섞는다 (합성 데이터).
 * 개업일 null(원본 없음·무효) / 상호 null / 기간 미산정(사유) / 실제 0개월 / 폐업일 없는 폐업(사유별) /
 * 같은 license_no·다른 source 2행(같은 날짜 — source·license_no로 순서 고정 확인)
 * BE 규칙대로 개업일 오름차순, 개업일 미확인은 마지막.
 */
const MISSING_HISTORY_STORES: HistoryStore[] = [
  {
    source: 'general_restaurant',
    license_no: '3130000-101-2015-00088',
    name: null,
    category: 'restaurant',
    sub_category: 'chinese',
    open_date: '2015-03-02',
    close_date: '2017-06-30',
    operating_months: 27,
    operating_period_status: 'fact',
    operating_period_reason: null,
    store_status: 'closed',
    franchise: 'unknown',
    franchise_basis: null,
    franchise_reference_year: null,
    floor_unit: null,
    location_match: 'unverified',
  },
  {
    source: 'general_restaurant',
    license_no: '3130000-101-2018-00140',
    name: '○○국수',
    category: 'restaurant',
    sub_category: 'korean',
    open_date: '2018-04-01',
    close_date: null,
    operating_months: null,
    operating_period_status: 'no_data',
    operating_period_reason: 'missing_close_date',
    store_status: 'closed',
    franchise: 'independent',
    franchise_basis: 'external_classification',
    franchise_reference_year: null,
    floor_unit: '1층',
    location_match: 'same_spot',
  },
  {
    source: 'general_restaurant',
    license_no: '3130000-101-2019-00222',
    name: '△△덮밥',
    category: 'restaurant',
    sub_category: 'japanese',
    open_date: '2019-09-09',
    close_date: null,
    operating_months: null,
    operating_period_status: 'no_data',
    operating_period_reason: 'invalid_date_order',
    store_status: 'closed',
    franchise: 'unknown',
    franchise_basis: null,
    franchise_reference_year: null,
    floor_unit: '2층',
    location_match: 'same_building',
  },
  {
    // 같은 관리번호·다른 원천 ① 일반음식점 — 폐업일 무효
    source: 'general_restaurant',
    license_no: 'SAMPLE-DUP-001',
    name: '◇◇한식당',
    category: 'restaurant',
    sub_category: 'korean',
    open_date: '2021-05-01',
    close_date: null,
    operating_months: null,
    operating_period_status: 'no_data',
    operating_period_reason: 'invalid_close_date',
    store_status: 'closed',
    franchise: 'unknown',
    franchise_basis: null,
    franchise_reference_year: null,
    floor_unit: null,
    location_match: 'unverified',
  },
  {
    // 같은 관리번호·다른 원천 ② 휴게음식점 — 합치지 않고 두 행 유지
    source: 'rest_cafe',
    license_no: 'SAMPLE-DUP-001',
    name: '◇◇카페',
    category: 'cafe',
    sub_category: 'cafe',
    open_date: '2021-05-01',
    close_date: null,
    operating_months: 66,
    operating_period_status: 'fact',
    operating_period_reason: null,
    store_status: 'open',
    franchise: 'independent',
    franchise_basis: 'external_classification',
    franchise_reference_year: null,
    floor_unit: '2층',
    location_match: 'same_building',
  },
  {
    // 실제 0개월 (미산정 아님)
    source: 'rest_cafe',
    license_no: '3130000-104-2026-00310',
    name: '☆☆커피',
    category: 'cafe',
    sub_category: 'cafe',
    open_date: '2026-10-20',
    close_date: null,
    operating_months: 0,
    operating_period_status: 'fact',
    operating_period_reason: null,
    store_status: 'open',
    franchise: 'franchise',
    franchise_basis: 'catalog_exact_name',
    franchise_reference_year: 2025,
    floor_unit: '1층',
    location_match: 'same_spot',
  },
  {
    // 개업일 원본 없음 (기간도 미산정)
    source: 'general_restaurant',
    license_no: '3130000-101-0000-00501',
    name: '□□식당',
    category: 'restaurant',
    sub_category: 'korean',
    open_date: null,
    close_date: '2016-02-29',
    operating_months: null,
    operating_period_status: 'no_data',
    operating_period_reason: 'missing_open_date',
    store_status: 'closed',
    franchise: 'unknown',
    franchise_basis: null,
    franchise_reference_year: null,
    floor_unit: null,
    location_match: 'unverified',
  },
  {
    // 개업일 무효 (1960년 이전·미래 등으로 BE가 비움)
    source: 'rest_cafe',
    license_no: '3130000-104-0000-00502',
    name: '◎◎다방',
    category: 'cafe',
    sub_category: 'cafe',
    open_date: null,
    close_date: null,
    operating_months: null,
    operating_period_status: 'no_data',
    operating_period_reason: 'invalid_open_date',
    store_status: 'other',
    franchise: 'unknown',
    franchise_basis: null,
    franchise_reference_year: null,
    floor_unit: null,
    location_match: 'unverified',
  },
]

const HISTORY_META: ApiMeta = {
  ...DEMO_META,
  source: ['R5', 'R6', 'R9'],
  as_of: '2026-11-09',
  space: 'point',
}

/**
 * 테스트용 규칙
 * - building_key에 "error" 포함 → 500 INTERNAL_ERROR (오류 화면 확인)
 * - building_key에 "empty" 포함 → 이력 0건 (빈 결과 화면 확인)
 * - building_key에 "missing" 포함 → 결측·미산정·원천 중복 경계 응답 (MISSING_HISTORY_STORES)
 * - floor_unit이 없으면 API 판정 규칙대로 모든 점포 location_match = unverified
 */
export const storeHistoryMock: MockHandler = (query) => {
  const buildingKey = query.get('building_key')
  if (!buildingKey) return fail(400, 'INVALID_PARAM', '입력값을 다시 확인해 주세요.')
  if (buildingKey.includes('error'))
    return fail(500, 'INTERNAL_ERROR', '일시적인 오류가 발생했어요.')
  if (buildingKey.includes('empty')) {
    const empty: StoreHistory = {
      total: 0,
      stores: [],
      message: '이 건물에서 확인된 음식점·카페 인허가 기록이 없어요',
    }
    return ok(empty, { ...HISTORY_META, denominator: 0 })
  }
  const hasFloor = !!query.get('floor_unit')
  if (buildingKey.includes('missing')) {
    const data: StoreHistory = {
      total: MISSING_HISTORY_STORES.length,
      stores: MISSING_HISTORY_STORES,
      message: null,
    }
    return ok(data, { ...HISTORY_META, denominator: MISSING_HISTORY_STORES.length })
  }
  const stores = hasFloor
    ? HISTORY_STORES
    : HISTORY_STORES.map((s) => ({ ...s, location_match: 'unverified' as const }))
  const data: StoreHistory = { total: stores.length, stores, message: null }
  return ok(data, { ...HISTORY_META, denominator: stores.length })
}
