/** /stores/history·/stores/nearby·/stores/snapshot 목업 — 시연용 가상 값 */
import type {
  NearbyMarker,
  NearbyStores,
  SnapshotStore,
  StoreHistory,
  StoreSnapshot,
} from '../../types/stores'
import { DEMO_META, fail, isRestaurant, monthEnd, ok, radiusSpace } from './common'
import type { MockHandler } from './index'
import { DATA_RANGE } from './meta'

/** 이력: same_spot / same_building / unverified 가 모두 나오게 구성 */
export const storeHistoryMock: MockHandler = (query) => {
  if (!query.get('building_key')) return fail(400, 'INVALID_PARAM', '입력값을 다시 확인해 주세요.')
  const data: StoreHistory = {
    total: 3,
    stores: [
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
    ],
    message: null,
  }
  return ok(data, {
    ...DEMO_META,
    source: ['R5', 'R6', 'R9'],
    as_of: '2026-11-09',
    space: 'point',
    denominator: 3,
  })
}

const CAFE_MARKERS: NearbyMarker[] = [
  {
    license_no: '3130000-104-2020-00011',
    name: '○○로스터스',
    sub_category: 'cafe',
    lat: 37.5571,
    lng: 126.9234,
    distance_m: 152,
    open_date: '2020-05-20',
    close_date: null,
    operating_months: 77,
    current_status: 'open',
    franchise: 'independent',
    area_m2: 48.2,
  },
  {
    license_no: '3130000-104-2023-00321',
    name: '△△커피',
    sub_category: 'cafe',
    lat: 37.554,
    lng: 126.9198,
    distance_m: 321,
    open_date: '2023-08-01',
    close_date: null,
    operating_months: 38,
    current_status: 'open',
    franchise: 'unknown',
    area_m2: null,
  },
]

const RESTAURANT_MARKERS: NearbyMarker[] = [
  {
    license_no: '3130000-101-2018-00077',
    name: '○○국밥',
    sub_category: 'korean',
    lat: 37.5569,
    lng: 126.9211,
    distance_m: 88,
    open_date: '2018-04-10',
    close_date: null,
    operating_months: 102,
    current_status: 'open',
    franchise: 'independent',
    area_m2: 72.5,
  },
  {
    license_no: '3130000-101-2021-00412',
    name: '△△반점',
    sub_category: 'chinese',
    lat: 37.5552,
    lng: 126.9241,
    distance_m: 230,
    open_date: '2021-09-01',
    close_date: null,
    operating_months: 62,
    current_status: 'open',
    franchise: 'unknown',
    area_m2: null,
  },
]

export const nearbyStoresMock: MockHandler = (query) => {
  if (!query.get('category'))
    return fail(400, 'CATEGORY_REQUIRED', '카페 또는 음식점을 선택해 주세요.')
  const { radius, space } = radiusSpace(query)
  const asOf = monthEnd(query.get('as_of'))
  const markers = isRestaurant(query) ? RESTAURANT_MARKERS : CAFE_MARKERS
  const data: NearbyStores = {
    center: { lat: 37.5563, lng: 126.922 },
    radius_m: radius,
    as_of: asOf,
    count: markers.length,
    excluded_no_coord: 1,
    markers,
    message: null,
  }
  return ok(data, {
    ...DEMO_META,
    source: ['R5', 'R6', 'R9'],
    as_of: asOf,
    space,
    denominator: markers.length,
  })
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
