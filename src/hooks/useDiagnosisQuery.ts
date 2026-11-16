import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import {
  CATEGORIES,
  DEFAULT_AREA,
  MIN_AS_OF,
  DEFAULT_INCLUDE_UNKNOWN,
  DEFAULT_RADIUS,
  FACILITY_SIZE_OPTIONS,
  RADIUS_OPTIONS,
  RESTAURANT_SUB_CATEGORIES,
  type Category,
  type FacilitySize,
  type RadiusMeters,
  type SubCategory,
} from '../constants/diagnosis'
import type { DiagnosisQuery } from '../types/diagnosis'
import { ANALYSIS_API_VERSION } from '../api/analysisProfile'
import type { AnalysisApiVersion } from '../config/analysisVersion'
const SUB_IDS: readonly string[] = RESTAURANT_SUB_CATEGORIES.map((s) => s.id)

const isCategory = (v: string | null): v is Category => CATEGORIES.some((c) => c.id === v)
const isRadius = (v: number): v is RadiusMeters => (RADIUS_OPTIONS as readonly number[]).includes(v)
const isFacility = (v: string | null): v is FacilitySize =>
  FACILITY_SIZE_OPTIONS.some((f) => f.id === v)
const isSub = (v: string): v is SubCategory => SUB_IDS.includes(v)
const isYearMonth = (v: string | null): v is string => !!v && /^\d{4}-(0[1-9]|1[0-2])$/.test(v)

/** 대한민국 범위 안의 숫자 좌표만 받는다 (잘못된 값은 null) */
const LAT_RANGE = [33, 39] as const
const LNG_RANGE = [124, 132] as const
function parseCoord(raw: string | null, [min, max]: readonly [number, number]): number | null {
  if (raw === null || raw.trim() === '') return null
  const n = Number(raw)
  return Number.isFinite(n) && n >= min && n <= max ? n : null
}
const textOrNull = (v: string | null) => (v && v.trim() !== '' ? v.trim() : null)

/** URL 쿼리 → 진단 조건 (잘못된 값은 기본값으로 대체) */
export function parseDiagnosisQuery(
  params: URLSearchParams,
  _version: AnalysisApiVersion = ANALYSIS_API_VERSION,
): DiagnosisQuery {
  void _version // API profile does not change the user conditions.
  const category = params.get('category')
  const radius = Number(params.get('radius'))
  const asOf = params.get('asOf')
  const area = params.get('area')
  return {
    address: params.get('address') ?? '',
    historyScope:
      params.get('historyScope') === 'floor'
        ? 'floor'
        : params.get('historyScope') === 'unit'
          ? 'unit'
          : undefined,
    historyIdentity:
      params.get('historyIdentity') === 'verified_building' ? 'verified_building' : undefined,
    detailText: params.get('detail') ?? undefined,
    detailUnverified: params.get('detailMode') === 'unverified',
    category: isCategory(category) ? category : null,
    subCategories:
      category === 'restaurant' ? (params.get('sub') ?? '').split(',').filter(isSub) : [],
    radius: isRadius(radius) ? radius : DEFAULT_RADIUS,
    // 2010년(MIN_AS_OF)보다 이른 예전 링크는 고를 수 있는 가장 이른 달로 맞춘다 (오류 화면 대신)
    asOf: isYearMonth(asOf) ? (asOf < MIN_AS_OF ? MIN_AS_OF : asOf) : null,
    area: isFacility(area) ? area : DEFAULT_AREA,
    // 기본값(true)일 때는 URL에 남기지 않으므로 'false'일 때만 false
    includeUnknown:
      (params.get('areaUnknown') ?? params.get('includeUnknown')) === 'false'
        ? false
        : DEFAULT_INCLUDE_UNKNOWN,
    lat: parseCoord(params.get('lat'), LAT_RANGE),
    lng: parseCoord(params.get('lng'), LNG_RANGE),
    buildingKey: textOrNull(params.get('bk')),
    floorUnit: textOrNull(params.get('floor')),
    sigungu: textOrNull(params.get('gu')),
  }
}

/** 진단 조건 → URL 쿼리 문자열 (기본값은 생략해 주소를 짧게 유지) */
export function toDiagnosisSearch(
  q: DiagnosisQuery,
  version: AnalysisApiVersion = ANALYSIS_API_VERSION,
): string {
  const p = new URLSearchParams()
  if (q.address) p.set('address', q.address)
  if (q.historyScope) p.set('historyScope', q.historyScope)
  if (q.historyIdentity) p.set('historyIdentity', q.historyIdentity)
  if (q.detailText) p.set('detail', q.detailText)
  if (q.detailUnverified) p.set('detailMode', 'unverified')
  if (q.category) p.set('category', q.category)
  if (q.lat !== null) p.set('lat', String(q.lat))
  if (q.lng !== null) p.set('lng', String(q.lng))
  if (q.buildingKey) p.set('bk', q.buildingKey)
  if (q.floorUnit) p.set('floor', q.floorUnit)
  if (q.sigungu) p.set('gu', q.sigungu)
  const subCategories = q.category === 'restaurant' ? q.subCategories.filter(isSub) : []
  if (subCategories.length) p.set('sub', subCategories.join(','))
  if (q.radius !== DEFAULT_RADIUS) p.set('radius', String(q.radius))
  if (q.asOf) p.set('asOf', q.asOf)
  if (q.area !== DEFAULT_AREA) p.set('area', q.area)
  if (version === 'v2') p.set('analysisVersion', 'v2')
  if (!q.includeUnknown) p.set('areaUnknown', 'false')
  const s = p.toString()
  return s ? `?${s}` : ''
}

/** 결과 화면을 열 수 있는지: 주소·업종·좌표·건물 키가 모두 있어야 한다 (geocode 결과로 채움) */
export function isDiagnosisReady(q: DiagnosisQuery): boolean {
  return (
    q.address.trim() !== '' &&
    q.category !== null &&
    q.lat !== null &&
    q.lng !== null &&
    q.buildingKey !== null
  )
}

/** 진단 조건의 좌표 (없으면 null) — toCommonQueryParams에 넘긴다 */
export function getCoordinates(q: DiagnosisQuery): { lat: number; lng: number } | null {
  return q.lat !== null && q.lng !== null ? { lat: q.lat, lng: q.lng } : null
}

/** 현재 URL의 진단 조건을 읽고, 일부만 바꿔 갱신한다 */
export function useDiagnosisQuery() {
  const [params, setParams] = useSearchParams()
  const query = useMemo(() => parseDiagnosisQuery(params), [params])

  const updateQuery = useCallback(
    (patch: Partial<DiagnosisQuery>) => {
      setParams(new URLSearchParams(toDiagnosisSearch({ ...query, ...patch })), { replace: true })
    },
    [query, setParams],
  )

  return { query, updateQuery, isReady: isDiagnosisReady(query), search: toDiagnosisSearch(query) }
}
