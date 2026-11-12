/**
 * GET /api/stores/nearby · /api/stores/snapshot 목업 — 시연용 가상 값.
 * 입력 좌표에서 동(dx)·북(dy)으로 몇 m 떨어진 곳에 점포를 두고, 요청한 반경·필터로 거른다.
 * (거리 계산·필터는 목업 안에서만 하는 흉내이며, 실제 계산은 서버가 한다)
 *
 * 이 점포 목록이 목업 숫자의 단일 출처다. /risk(동종업체 수·참고 폐업률·생존율),
 * /market/activity(개·폐업 수·연도별 추이·업종별 점포 수), AI 해석 문장이 모두 여기서 나와
 * 같은 조건이면 화면 어디서나 숫자가 서로 맞는다.
 *
 * 시연 기준일(2026-10-31)·반경별 목표 (필터 없음):
 * - 카페   300m 6곳(표본 부족) / 500m 12곳 / 1,000m 18곳
 * - 음식점 300m 5곳(표본 부족) / 500m 13곳 / 1,000m 18곳
 */
import type { NearbyMarker, NearbyStores, SnapshotStore, StoreSnapshot } from '../../types/stores'
import { shiftMonth } from '../../utils/date'
import {
  DEMO_META,
  fail,
  franchiseBasis,
  isMockResult,
  isRestaurant,
  monthEnd,
  ok,
  radiusSpace,
  unknownFlags,
} from './common'
import type { MockHandler } from './index'
import { DATA_RANGE } from './meta'

type NearbySeed = Omit<NearbyMarker, 'lat' | 'lng' | 'distance_m'> & { dx: number; dy: number }

/** 시연 기준일 — 기준 시점을 고르지 않으면 이 날 영업 중인 점포가 "지금" 점포다 */
export const DEMO_TODAY = '2026-10-31'

/** 목업 전용: 두 날짜 사이 개월 수 (소수점 버림) */
function monthsBetween(from: string, to: string): number {
  const [y1, m1, d1] = from.split('-').map(Number)
  const [y2, m2, d2] = to.split('-').map(Number)
  return (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0)
}

/**
 * 영업 기간은 폐업일(없으면 시연 기준일)까지로 맞춘다. 폐업일이 있으면 closed.
 * 원천은 카페 = 휴게음식점(rest_cafe), 음식점 = 일반음식점(general_restaurant)
 */
const seed = (
  license_no: string,
  name: string | null,
  sub_category: NearbyMarker['sub_category'],
  [dx, dy]: [number, number],
  open_date: string,
  close_date: string | null,
  franchise: NearbyMarker['franchise'],
  area_m2: number | null,
  current_status: NearbyMarker['current_status'] = close_date ? 'closed' : 'open',
  source: NearbyMarker['source'] = sub_category === 'cafe' ? 'rest_cafe' : 'general_restaurant',
): NearbySeed => ({
  source,
  license_no,
  name,
  sub_category,
  dx,
  dy,
  open_date,
  close_date,
  operating_months: monthsBetween(open_date, close_date ?? DEMO_TODAY),
  operating_period_status: 'fact',
  operating_period_reason: null,
  current_status,
  franchise,
  // 근거: 프랜차이즈는 2025년 목록명 일치 추정, 일부는 기존 외부 분류 (세 가지 표시 확인용)
  ...franchiseBasis(franchise, EXTERNAL_FRANCHISE.has(license_no)),
  area_m2,
})

/** 목업 전용: 기존 외부 분류로 프랜차이즈인 점포 (나머지 프랜차이즈는 목록명 일치 추정) */
const EXTERNAL_FRANCHISE = new Set(['3130000-104-2019-00102', '3130000-101-2022-00255'])

/* prettier-ignore */
const CAFE_SEEDS: NearbySeed[] = [
  // 300m 안 — 지금 영업 6곳(휴업 1곳 포함), 최근 12개월 폐업 1곳, 예전 폐업 1곳
  seed('3130000-104-2020-00011', '○○로스터스', 'cafe', [60, 70], '2020-05-20', null, 'independent', 48.2),
  seed('3130000-104-2019-00102', '□□커피 ○○점', 'cafe', [-120, 40], '2019-09-02', null, 'franchise', 82.5),
  seed('3130000-104-2021-00230', '△△디저트', 'cafe', [150, -110], '2021-03-15', '2026-02-28', 'independent', 29.7),
  seed('3130000-104-2023-00321', '△△커피', 'cafe', [-200, -150], '2023-08-01', null, 'unknown', null),
  seed('3130000-104-2025-00140', '◎◎티하우스', 'cafe', [-180, 200], '2025-03-10', null, 'independent', 41.0),
  seed('3130000-104-2026-00062', '○○빙수', 'cafe', [100, -240], '2026-04-02', null, 'independent', 31.5),
  seed('3130000-104-2018-00044', '◇◇다방', 'cafe', [260, 100], '2018-01-10', null, 'independent', 66.1, 'other'),
  seed('3130000-104-2020-00380', '○○디저트카페', 'cafe', [220, -180], '2020-10-10', '2023-12-31', 'independent', 36.3),
  // 300~500m — 지금 영업 6곳, 최근 12개월 폐업 1곳, 예전 폐업 1곳
  seed('3130000-104-2024-00517', '☆☆카페 ○○역점', 'cafe', [300, -300], '2024-11-20', null, 'franchise', 105.8),
  seed('3130000-104-2017-00610', '○○베이커리카페', 'cafe', [80, 450], '2017-04-05', null, 'independent', 132.2),
  seed('3130000-104-2025-00071', '□□라운지카페', 'cafe', [-380, -180], '2025-01-15', null, 'unknown', null),
  seed('3130000-104-2025-00266', '◇◇브루잉', 'cafe', [420, 150], '2025-06-01', null, 'independent', 38.4),
  seed('3130000-104-2026-00015', '☆☆커피', 'cafe', [-330, 120], '2026-01-10', null, 'franchise', 59.0),
  seed('3130000-104-2022-00811', '△△티룸', 'cafe', [200, 400], '2022-12-05', null, 'independent', 44.6),
  seed('3130000-104-2025-00098', '□□로스팅랩', 'cafe', [-250, -380], '2025-02-01', '2025-12-20', 'independent', 57.9),
  seed('3130000-104-2019-00230', '◎◎커피', 'cafe', [-90, 330], '2019-03-01', '2024-07-31', 'franchise', 70.2),
  // 500~1,000m — 지금 영업 6곳, 최근 12개월 폐업 1곳
  seed('3130000-104-2021-00905', '□□커피 ○○2호점', 'cafe', [700, 150], '2021-10-01', null, 'franchise', 75.3),
  seed('3130000-104-2016-00811', '△△카페', 'cafe', [-420, 760], '2016-08-22', null, 'independent', 52.0),
  seed('3130000-104-2019-00999', '◇◇에스프레소', 'cafe', [610, -690], '2019-05-27', null, 'independent', 28.4),
  seed('3130000-104-2024-00702', '○○카페', 'cafe', [-560, -260], '2024-02-19', null, 'unknown', null),
  seed('3130000-104-2022-00930', '☆☆브런치카페', 'cafe', [520, 480], '2022-11-20', null, 'independent', 98.7),
  seed('3130000-104-2023-00412', '◎◎북카페', 'cafe', [-700, 300], '2023-05-02', null, 'independent', 115.0),
  seed('3130000-104-2025-00303', '□□젤라또', 'cafe', [650, -300], '2025-04-01', '2026-06-30', 'franchise', 33.0),
]

/* prettier-ignore */
const RESTAURANT_SEEDS: NearbySeed[] = [
  // 300m 안 — 지금 영업 5곳(휴업 1곳 포함), 최근 12개월 폐업 1곳
  seed('3130000-101-2018-00077', '○○국밥', 'korean', [50, -70], '2018-04-10', null, 'independent', 72.5),
  seed('3130000-101-2021-00412', '△△반점', 'chinese', [-140, 90], '2021-09-01', null, 'unknown', null),
  seed('3130000-101-2022-00255', '◇◇파스타', 'western', [-230, -160], '2022-12-03', null, 'franchise', 99.2),
  seed('3130000-101-2023-00388', '☆☆라멘', 'japanese', [-100, 250], '2023-04-11', null, 'independent', 33.1),
  seed('3130000-101-2017-00301', '◎◎한정식', 'korean', [250, -130], '2017-07-17', null, 'independent', 165.3, 'other'),
  seed('3130000-101-2022-00133', '□□스시', 'japanese', [170, 120], '2022-11-15', '2026-03-31', 'independent', 45.6),
  // 300~500m — 지금 영업 8곳, 최근 12개월 폐업 2곳, 예전 폐업 1곳
  seed('3130000-101-2023-00517', '○○버거 ○○점', 'western', [-90, 440], '2023-01-20', null, 'franchise', 120.7),
  seed('3130000-101-2015-00608', '□□설렁탕', 'korean', [400, -150], '2015-11-30', null, 'unknown', null),
  seed('3130000-101-2025-00844', '◇◇비스트로', 'western', [300, 330], '2025-02-24', null, 'independent', 70.4),
  seed('3130000-101-2023-00955', '◎◎백반', 'korean', [-420, 100], '2023-09-14', null, 'independent', 26.4),
  seed('3130000-101-2025-00733', '△△돈카츠', 'japanese', [-350, -250], '2025-07-08', null, 'independent', 52.9),
  seed('3130000-101-2026-00120', '○○칼국수', 'korean', [330, 200], '2026-02-02', null, 'independent', 39.7),
  seed('3130000-101-2025-00015', '△△양식당', 'western', [150, 420], '2025-01-05', null, 'independent', 84.0),
  seed('3130000-101-2025-00470', '◇◇초밥', 'japanese', [-450, 0], '2025-05-20', null, 'franchise', 61.2),
  seed('3130000-101-2016-00420', '○○중화요리', 'chinese', [320, 310], '2016-02-01', '2025-12-31', 'independent', 88.0),
  seed('3130000-101-2024-00901', '□□우동', 'japanese', [-300, -300], '2024-12-10', '2025-11-30', 'independent', 29.8),
  seed('3130000-101-2023-00210', '△△중식당', 'chinese', [380, -250], '2023-03-01', '2024-12-31', 'independent', 76.5),
  // 500~1,000m — 지금 영업 5곳, 예전 폐업 1곳
  seed('3130000-101-2019-00366', '○○냉면', 'korean', [650, -240], '2019-06-14', null, 'independent', 92.3),
  seed('3130000-101-2020-00733', '□□딤섬', 'chinese', [-640, -330], '2020-08-08', null, 'independent', 52.9),
  seed('3130000-101-2021-00844', '◇◇스테이크', 'western', [450, 750], '2021-12-24', null, 'franchise', 140.6),
  seed('3130000-101-2024-00290', '☆☆덮밥', 'japanese', [-720, 560], '2024-03-14', null, 'unknown', null),
  seed('3130000-101-2017-00505', '◎◎감자탕', 'korean', [800, -100], '2017-05-05', null, 'independent', 118.2),
  seed('3130000-101-2019-00122', '△△피자', 'western', [-600, 500], '2019-02-02', '2024-05-31', 'franchise', 66.0),
]

/**
 * 테스트 규칙: 결과 화면 주소창의 bk 또는 address에 "dup"이 있으면 (예: bk=마포구-dup-1)
 * 식별·결측 경계 점포 4곳을 300m 안에 더한다 (BE docs/fe-system-audit-request.md 4·5번 재현용).
 * - A·B: 관리번호는 같고 원천이 다른 두 점포 (좌표 다름, 표시 거리는 184m로 같음) → 서로 다른 점포
 * - C: 상호 null / D: 기간 미산정 (no_data + other_status, 기타 상태)
 * nearby·snapshot 요청에는 bk가 없어 화면 주소를 읽는다 (목업 전용).
 */
function dupScenario(): boolean {
  if (typeof window === 'undefined') return false
  const q = new URLSearchParams(window.location.search)
  return /dup/i.test(`${q.get('bk') ?? ''} ${q.get('address') ?? ''}`)
}

function dupSeeds(sub: NearbyMarker['sub_category']): NearbySeed[] {
  const no = 'DUP-2024-00001'
  const periodMissing = seed(
    'DUP-2021-00003',
    '기간 미산정 테스트',
    sub,
    [-60, 200],
    '2021-01-15',
    null,
    'independent',
    42.0,
    'other',
  )
  return [
    seed(
      no,
      '같은 번호 테스트 A',
      sub,
      [-160, -90],
      '2024-03-01',
      null,
      'independent',
      40.0,
      'open',
      'rest_cafe',
    ),
    seed(
      no,
      '같은 번호 테스트 B',
      sub,
      [40, -180],
      '2022-06-01',
      null,
      'independent',
      55.0,
      'open',
      'general_restaurant',
    ),
    seed('DUP-2023-00002', null, sub, [120, 60], '2023-02-01', null, 'unknown', null),
    {
      ...periodMissing,
      operating_months: null,
      operating_period_status: 'no_data',
      operating_period_reason: 'other_status',
    },
  ]
}

const M_PER_DEG_LAT = 111320

/** 목업 전용: 시설 규모 구간 판정 */
function inArea(area: string | null, m2: number): boolean {
  if (!area || area === 'all') return true
  if (area === 'lt33') return m2 < 33
  if (area === '33to66') return m2 >= 33 && m2 < 66
  if (area === '66to99') return m2 >= 66 && m2 < 99
  return m2 >= 99
}

/**
 * 목업 전용: as_of가 데이터 범위 밖이면 422. 실제 BE처럼 error.detail은 보내지 않는다
 * (화면은 data-range 응답으로 범위를 안내 — useAsOfRangeMessage)
 */
function outOfRange(asOfMonth: string | null) {
  if (!asOfMonth || !DATA_RANGE.min_month) return null
  if (asOfMonth < DATA_RANGE.min_month || asOfMonth > DATA_RANGE.max_month)
    return fail(422, 'AS_OF_OUT_OF_RANGE', '선택한 시점은 데이터 제공 범위 밖이에요.')
  return null
}

/** 목업 전용: 반경·필터에 맞는 점포 (시점 조건 없음 — 개·폐업 수 셈용) */
function storesInRadius(query: URLSearchParams): NearbyMarker[] {
  const { radius } = radiusSpace(query)
  const lat = Number(query.get('lat')) || 37.5563
  const lng = Number(query.get('lng')) || 126.922
  const subs = (query.get('sub_category') ?? '').split(',').filter(Boolean)
  const area = query.get('area')
  const franchise = query.get('franchise') ?? 'all'
  // 면적·가맹 정보 없음 포함은 따로 (legacy include_unknown은 둘 다에 같은 값). 형식 오류는 핸들러가 먼저 422
  const flags = unknownFlags(query)
  const unknownArea = isMockResult(flags) ? true : flags.area
  const unknownFranchise = isMockResult(flags) ? true : flags.franchise

  return (
    [
      ...(isRestaurant(query) ? RESTAURANT_SEEDS : CAFE_SEEDS),
      ...(dupScenario() ? dupSeeds(isRestaurant(query) ? 'korean' : 'cafe') : []),
    ]
      .map(({ dx, dy, ...store }) => ({
        ...store,
        lat: Number((lat + dy / M_PER_DEG_LAT).toFixed(6)),
        lng: Number((lng + dx / (M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180))).toFixed(6)),
        distance_m: Math.round(Math.hypot(dx, dy)),
      }))
      .filter((m) => m.distance_m <= radius)
      .filter((m) => subs.length === 0 || subs.includes(m.sub_category))
      // 정보 없음(면적 null / 프랜차이즈 unknown)은 각 포함 플래그일 때 필터와 상관없이 포함
      .filter((m) => (m.area_m2 === null ? unknownArea : inArea(area, m.area_m2)))
      .filter((m) =>
        m.franchise === 'unknown'
          ? unknownFranchise
          : franchise === 'all' || m.franchise === franchise,
      )
      .sort((a, b) => a.distance_m - b.distance_m)
  )
}

/**
 * 목업 전용: 반경·필터에 맞고 기준일 T에 영업하던 점포 = 지도·표·동종업체 수의 같은 집합
 * (T 영업 = 개업일 ≤ T 그리고 (폐업일 없음 또는 폐업일 > T)). as_of가 없으면 T = 시연 기준일.
 */
export function storesAt(query: URLSearchParams): NearbyMarker[] {
  const t = monthEnd(query.get('as_of'))
  return storesInRadius(query).filter(
    (m) => m.open_date <= t && (m.close_date === null || m.close_date > t),
  )
}

/** 목업 전용: 기준일 T 기준 YYYY-MM-DD 범위 (from 초과 ~ to 이하) */
const between = (d: string | null, from: string, to: string) => d !== null && d > from && d <= to

/** 목업 전용: T에서 n개월 전 달의 말일 */
const monthsBack = (t: string, n: number) => monthEnd(shiftMonth(t.slice(0, 7), -n))

/**
 * 목업 전용: /risk·/market/activity가 함께 쓰는 개·폐업 집계 (같은 점포 목록에서 셈)
 * - 최근 12개월 = T 직전 12개월, 연도별 = T 연도 직전 5년
 * - 1년 생존율 대상 = 12~24개월 전 개업, 3년 = 36~48개월 전 개업. 그 뒤 n개월 넘게 영업했으면 생존
 */
export function storeStats(query: URLSearchParams) {
  const t = monthEnd(query.get('as_of'))
  const all = storesInRadius(query)
  const openNow = storesAt(query)
  const start12 = monthsBack(t, 12)
  const opened12m = all.filter((m) => between(m.open_date, start12, t)).length
  const closed12m = all.filter((m) => between(m.close_date, start12, t)).length
  const cohort = (fromBack: number, toBack: number, months: number) => {
    const from = monthsBack(t, fromBack)
    const to = monthsBack(t, toBack)
    const members = all.filter((m) => between(m.open_date, from, to))
    // T에 아직 영업 중이면(개업 후 n개월 이상 지남) 생존, 폐업했으면 영업 기간이 n개월 이상일 때 생존
    const survived = members.filter(
      (m) =>
        m.close_date === null ||
        m.close_date > t ||
        monthsBetween(m.open_date, m.close_date) >= months,
    ).length
    return {
      denominator: members.length,
      numerator: survived,
      period: `${shiftMonth(from.slice(0, 7), 1)}~${to.slice(0, 7)}`,
    }
  }
  const year = Number(t.slice(0, 4))
  return {
    t,
    openNow,
    period12m: `${shiftMonth(t.slice(0, 7), -11)}~${t.slice(0, 7)}`,
    opened12m,
    closed12m,
    /** 참고 폐업률 분모 = 최근 12개월 중 한 번이라도 영업한 점포 = 지금 영업 + 그 사이 폐업 */
    closureDenominator: openNow.length + closed12m,
    survival1y: cohort(24, 12, 12),
    survival3y: cohort(48, 36, 36),
    yearly: [5, 4, 3, 2, 1].map((back) => {
      const y = String(year - back)
      return {
        year: year - back,
        opened: all.filter((m) => m.open_date.startsWith(y)).length,
        closed: all.filter((m) => m.close_date?.startsWith(y)).length,
      }
    }),
  }
}

export const nearbyStoresMock: MockHandler = (query) => {
  if (!query.get('category'))
    return fail(400, 'CATEGORY_REQUIRED', '카페 또는 음식점을 선택해 주세요.')
  const flags = unknownFlags(query)
  if (isMockResult(flags)) return flags
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
  const flags = unknownFlags(query)
  if (isMockResult(flags)) return flags
  const asOfMonth = query.get('as_of')
  if (!asOfMonth || !/^\d{4}-(0[1-9]|1[0-2])$/.test(asOfMonth))
    return fail(400, 'INVALID_PARAM', '입력값을 다시 확인해 주세요.')
  const rangeError = outOfRange(asOfMonth)
  if (rangeError) return rangeError
  const { space } = radiusSpace(query)
  const asOf = monthEnd(asOfMonth)
  const stores: SnapshotStore[] = storesAt(query).map((m) => ({
    source: m.source,
    license_no: m.license_no,
    name: m.name,
    sub_category: m.sub_category,
    lat: m.lat,
    lng: m.lng,
    open_date: m.open_date,
    close_date: m.close_date,
    operating_months: m.operating_months,
    operating_period_status: m.operating_period_status,
    operating_period_reason: m.operating_period_reason,
    current_status: m.current_status,
    franchise: m.franchise,
    franchise_basis: m.franchise_basis,
    franchise_reference_year: m.franchise_reference_year,
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
    // N = A + B + 기타가 문장에서도 맞게, 기타(휴업 등)가 있으면 함께 적는다
    excluded_no_coord: 1,
    summary_text: `${y}.${mo} 시점 동일 업종 ${stores.length}곳 → 지금도 운영 중 ${stillOpen}곳 · 폐업 ${closedSince}곳${other > 0 ? ` · 기타(휴업 등) ${other}곳` : ''}`,
  }
  return ok(data, {
    ...DEMO_META,
    source: ['R5', 'R6'],
    as_of: asOf,
    space,
    denominator: stores.length,
  })
}
