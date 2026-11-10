/**
 * GET /api/stores/nearby · /api/stores/snapshot 목업 — 시연용 가상 값.
 * 입력 좌표에서 동(dx)·북(dy)으로 몇 m 떨어진 곳에 점포를 두고, 요청한 반경·필터로 거른다.
 * (거리 계산·필터는 목업 안에서만 하는 흉내이며, 실제 계산은 서버가 한다)
 */
import type { NearbyMarker, NearbyStores, SnapshotStore, StoreSnapshot } from '../../types/stores'
import { DEMO_META, fail, isRestaurant, monthEnd, ok, radiusSpace } from './common'
import type { MockHandler } from './index'
import { DATA_RANGE } from './meta'

type NearbySeed = Omit<NearbyMarker, 'lat' | 'lng' | 'distance_m'> & { dx: number; dy: number }

const seed = (
  license_no: string,
  name: string,
  sub_category: NearbyMarker['sub_category'],
  [dx, dy]: [number, number],
  open_date: string,
  close_date: string | null,
  operating_months: number,
  current_status: NearbyMarker['current_status'],
  franchise: NearbyMarker['franchise'],
  area_m2: number | null,
): NearbySeed => ({
  license_no,
  name,
  sub_category,
  dx,
  dy,
  open_date,
  close_date,
  operating_months,
  current_status,
  franchise,
  area_m2,
})

/* prettier-ignore */
const CAFE_SEEDS: NearbySeed[] = [
  seed('3130000-104-2020-00011', '○○로스터스', 'cafe', [60, 70], '2020-05-20', null, 77, 'open', 'independent', 48.2),
  seed('3130000-104-2019-00102', '□□커피 ○○점', 'cafe', [-120, 40], '2019-09-02', null, 86, 'open', 'franchise', 82.5),
  seed('3130000-104-2021-00230', '△△디저트', 'cafe', [150, -110], '2021-03-15', '2025-02-28', 47, 'closed', 'independent', 29.7),
  seed('3130000-104-2023-00321', '△△커피', 'cafe', [-200, -150], '2023-08-01', null, 38, 'open', 'unknown', null),
  seed('3130000-104-2018-00044', '◇◇다방', 'cafe', [260, 200], '2018-01-10', null, 106, 'other', 'independent', 66.1),
  seed('3130000-104-2022-00450', '◎◎티하우스', 'cafe', [-330, 120], '2022-06-01', null, 53, 'open', 'independent', 41.0),
  seed('3130000-104-2020-00517', '☆☆카페 ○○역점', 'cafe', [300, -300], '2020-11-11', '2024-07-31', 44, 'closed', 'franchise', 105.8),
  seed('3130000-104-2017-00610', '○○베이커리카페', 'cafe', [80, 520], '2017-04-05', null, 115, 'open', 'independent', 132.2),
  seed('3130000-104-2024-00702', '□□라운지카페', 'cafe', [-560, -260], '2024-02-19', null, 32, 'open', 'unknown', null),
  seed('3130000-104-2016-00811', '□□로스팅랩', 'cafe', [700, 150], '2016-08-22', '2023-12-31', 88, 'closed', 'independent', 57.9),
  seed('3130000-104-2021-00905', '△△커피 ○○점', 'cafe', [-420, 760], '2021-10-01', null, 61, 'open', 'franchise', 75.3),
  seed('3130000-104-2019-00999', '◇◇브루잉', 'cafe', [610, -690], '2019-05-27', null, 89, 'open', 'independent', 38.4),
]

/* prettier-ignore */
const RESTAURANT_SEEDS: NearbySeed[] = [
  seed('3130000-101-2018-00077', '○○국밥', 'korean', [50, -70], '2018-04-10', null, 102, 'open', 'independent', 72.5),
  seed('3130000-101-2021-00412', '△△반점', 'chinese', [-140, 90], '2021-09-01', null, 62, 'open', 'unknown', null),
  seed('3130000-101-2019-00133', '□□스시', 'japanese', [170, 120], '2019-12-02', '2025-06-30', 66, 'closed', 'independent', 45.6),
  seed('3130000-101-2020-00255', '◇◇파스타', 'western', [-230, -160], '2020-03-03', null, 80, 'open', 'franchise', 99.2),
  seed('3130000-101-2017-00301', '◎◎한정식', 'korean', [280, -190], '2017-07-17', null, 111, 'other', 'independent', 165.3),
  seed('3130000-101-2022-00388', '☆☆라멘', 'japanese', [-350, 140], '2022-04-11', null, 55, 'open', 'independent', 33.1),
  seed('3130000-101-2016-00420', '○○중화요리', 'chinese', [320, 310], '2016-02-01', '2024-10-31', 104, 'closed', 'independent', 88.0),
  seed('3130000-101-2023-00517', '○○버거 ○○점', 'western', [-90, 560], '2023-01-20', null, 45, 'open', 'franchise', 120.7),
  seed('3130000-101-2015-00608', '□□설렁탕', 'korean', [580, -240], '2015-11-30', null, 131, 'open', 'unknown', null),
  seed('3130000-101-2020-00733', '△△돈카츠', 'japanese', [-640, -330], '2020-08-08', '2023-05-31', 33, 'closed', 'independent', 52.9),
  seed('3130000-101-2021-00844', '◇◇비스트로', 'western', [450, 750], '2021-12-24', null, 59, 'open', 'independent', 70.4),
  seed('3130000-101-2019-00955', '◎◎백반', 'korean', [-720, 560], '2019-06-14', null, 88, 'open', 'independent', 26.4),
]

const M_PER_DEG_LAT = 111320

/** 목업 전용: 시설 규모 구간 판정 */
function inArea(area: string | null, m2: number): boolean {
  if (!area || area === 'all') return true
  if (area === 'lt33') return m2 < 33
  if (area === '33to66') return m2 >= 33 && m2 < 66
  if (area === '66to99') return m2 >= 66 && m2 < 99
  return m2 >= 99
}

/** 목업 전용: as_of가 데이터 범위 밖이면 422 (API 명세와 같은 detail) */
function outOfRange(asOfMonth: string | null) {
  if (!asOfMonth) return null
  if (asOfMonth < DATA_RANGE.min_month || asOfMonth > DATA_RANGE.max_month)
    return fail(422, 'AS_OF_OUT_OF_RANGE', '선택한 시점은 데이터 제공 범위 밖이에요.', {
      min_month: DATA_RANGE.min_month,
      max_month: DATA_RANGE.max_month,
    })
  return null
}

/**
 * 목업 전용: 반경·필터에 맞고 기준일 T에 영업하던 점포
 * (T 영업 = 개업일 ≤ T 그리고 (폐업일 없음 또는 폐업일 > T)). as_of가 없으면 시점 조건 없이 전체.
 */
function storesAt(query: URLSearchParams): NearbyMarker[] {
  const { radius } = radiusSpace(query)
  const asOfMonth = query.get('as_of')
  const t = asOfMonth ? monthEnd(asOfMonth) : null
  const lat = Number(query.get('lat')) || 37.5563
  const lng = Number(query.get('lng')) || 126.922
  const subs = (query.get('sub_category') ?? '').split(',').filter(Boolean)
  const area = query.get('area')
  const franchise = query.get('franchise') ?? 'all'
  const includeUnknown = query.get('include_unknown') !== 'false'

  return (
    (isRestaurant(query) ? RESTAURANT_SEEDS : CAFE_SEEDS)
      .map(({ dx, dy, ...store }) => ({
        ...store,
        lat: Number((lat + dy / M_PER_DEG_LAT).toFixed(6)),
        lng: Number((lng + dx / (M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180))).toFixed(6)),
        distance_m: Math.round(Math.hypot(dx, dy)),
      }))
      .filter((m) => m.distance_m <= radius)
      .filter((m) => !t || (m.open_date <= t && (m.close_date === null || m.close_date > t)))
      .filter((m) => subs.length === 0 || subs.includes(m.sub_category))
      // 정보 없음(면적 null / 프랜차이즈 unknown)은 include_unknown일 때 필터와 상관없이 포함
      .filter((m) => (m.area_m2 === null ? includeUnknown : inArea(area, m.area_m2)))
      .filter((m) =>
        m.franchise === 'unknown'
          ? includeUnknown
          : franchise === 'all' || m.franchise === franchise,
      )
      .sort((a, b) => a.distance_m - b.distance_m)
  )
}

export const nearbyStoresMock: MockHandler = (query) => {
  if (!query.get('category'))
    return fail(400, 'CATEGORY_REQUIRED', '카페 또는 음식점을 선택해 주세요.')
  const rangeError = outOfRange(query.get('as_of'))
  if (rangeError) return rangeError
  const { radius, space } = radiusSpace(query)
  const asOf = monthEnd(query.get('as_of'))
  const markers = storesAt(query)
  const data: NearbyStores = {
    center: { lat: Number(query.get('lat')) || 37.5563, lng: Number(query.get('lng')) || 126.922 },
    radius_m: radius,
    as_of: asOf,
    count: markers.length,
    excluded_no_coord: 1,
    markers,
    message: markers.length === 0 ? '조건에 맞는 점포가 없어요' : null,
  }
  return ok(data, {
    ...DEMO_META,
    source: ['R5', 'R6', 'R9'],
    as_of: asOf,
    space,
    denominator: markers.length,
  })
}

/**
 * GET /api/stores/snapshot 목업 — 기준 시점에 영업하던 점포의 지금 상태.
 * 같은 시드에서 뽑아 as_of에 따라 숫자가 달라지고, N = A + B + other가 항상 맞는다 (목업 안에서만 셈)
 */
export const storeSnapshotMock: MockHandler = (query) => {
  const asOfMonth = query.get('as_of')
  if (!asOfMonth || !/^\d{4}-(0[1-9]|1[0-2])$/.test(asOfMonth))
    return fail(400, 'INVALID_PARAM', '입력값을 다시 확인해 주세요.')
  const rangeError = outOfRange(asOfMonth)
  if (rangeError) return rangeError
  const { space } = radiusSpace(query)
  const asOf = monthEnd(asOfMonth)
  const stores: SnapshotStore[] = storesAt(query).map((m) => ({
    license_no: m.license_no,
    name: m.name,
    sub_category: m.sub_category,
    lat: m.lat,
    lng: m.lng,
    open_date: m.open_date,
    close_date: m.close_date,
    operating_months: m.operating_months,
    current_status: m.current_status,
  }))
  const stillOpen = stores.filter((s) => s.current_status === 'open').length
  const closedSince = stores.filter((s) => s.current_status === 'closed').length
  const other = stores.length - stillOpen - closedSince
  const [y, mo] = asOfMonth.split('-')
  const data: StoreSnapshot = {
    as_of: asOf,
    total_at_as_of: stores.length,
    still_open: stillOpen,
    closed_since: closedSince,
    other,
    stores,
    summary_text: `${y}.${mo} 시점 동일 업종 ${stores.length}곳 → 지금도 운영 중 ${stillOpen}곳 · 폐업 ${closedSince}곳`,
  }
  return ok(data, {
    ...DEMO_META,
    source: ['R5', 'R6'],
    as_of: asOf,
    space,
    denominator: stores.length,
  })
}
