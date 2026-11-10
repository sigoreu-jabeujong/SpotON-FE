/** /stores/history·/stores/nearby·/stores/snapshot 목업 — 시연용 가상 값 */
import type { ApiMeta } from '../../types/api'
import type { HistoryStore, SnapshotStore, StoreHistory, StoreSnapshot } from '../../types/stores'
import { DEMO_META, fail, monthEnd, ok, radiusSpace } from './common'
import type { MockHandler } from './index'
import { DATA_RANGE } from './meta'

/**
 * 이력 목업 — 시연용 가상 값. 지원 업종(카페·한식·중식·일식·양식)만.
 * same_spot / same_building / unverified, open / closed, franchise / independent / unknown 이 모두 나오게 8건.
 * API 규칙대로 인허가일 오름차순.
 */
const HISTORY_STORES: HistoryStore[] = [
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
  const stores = hasFloor
    ? HISTORY_STORES
    : HISTORY_STORES.map((s) => ({ ...s, location_match: 'unverified' as const }))
  const data: StoreHistory = { total: stores.length, stores, message: null }
  return ok(data, { ...HISTORY_META, denominator: stores.length })
}

const SNAPSHOT_STORES: SnapshotStore[] = [
  {
    license_no: '3130000-104-2019-00101',
    name: '○○다방',
    sub_category: 'cafe',
    lat: 37.5575,
    lng: 126.9201,
    open_date: '2019-06-01',
    close_date: null,
    operating_months: 89,
    current_status: 'open',
  },
  {
    license_no: '3130000-104-2020-00202',
    name: '△△디저트카페',
    sub_category: 'cafe',
    lat: 37.5549,
    lng: 126.9226,
    open_date: '2020-02-14',
    close_date: '2024-03-31',
    operating_months: 49,
    current_status: 'closed',
  },
]

export const storeSnapshotMock: MockHandler = (query) => {
  const asOfMonth = query.get('as_of')
  if (!asOfMonth || !/^\d{4}-(0[1-9]|1[0-2])$/.test(asOfMonth))
    return fail(400, 'INVALID_PARAM', '입력값을 다시 확인해 주세요.')
  if (asOfMonth < DATA_RANGE.min_month || asOfMonth > DATA_RANGE.max_month)
    return fail(422, 'AS_OF_OUT_OF_RANGE', '선택한 시점은 데이터 제공 범위 밖이에요.', {
      min_month: DATA_RANGE.min_month,
      max_month: DATA_RANGE.max_month,
    })
  const { space } = radiusSpace(query)
  const asOf = monthEnd(asOfMonth)
  const [y, m] = asOfMonth.split('-')
  const data: StoreSnapshot = {
    as_of: asOf,
    total_at_as_of: 12,
    still_open: 7,
    closed_since: 5,
    other: 0,
    stores: SNAPSHOT_STORES,
    summary_text: `${y}.${m} 시점 동일 업종 12곳 → 지금도 운영 중 7곳 · 폐업 5곳`,
  }
  return ok(data, { ...DEMO_META, as_of: asOf, space, denominator: 12 })
}
