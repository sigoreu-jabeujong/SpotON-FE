import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import {
  CATEGORIES,
  CAFE_SUB_CATEGORIES,
  DEFAULT_RADIUS,
  FACILITY_SIZE_OPTIONS,
  FRANCHISE_OPTIONS,
  RADIUS_OPTIONS,
  RESTAURANT_SUB_CATEGORIES,
  type Category,
  type FacilitySize,
  type FranchiseFilter,
  type RadiusMeters,
  type SubCategory,
} from '../constants/diagnosis'
import type { DiagnosisQuery } from '../types/diagnosis'

const SUB_IDS: readonly string[] = [
  ...RESTAURANT_SUB_CATEGORIES.map((s) => s.id),
  ...CAFE_SUB_CATEGORIES.map((s) => s.id),
]

const isCategory = (v: string | null): v is Category => CATEGORIES.some((c) => c.id === v)
const isRadius = (v: number): v is RadiusMeters => (RADIUS_OPTIONS as readonly number[]).includes(v)
const isFranchise = (v: string | null): v is FranchiseFilter =>
  FRANCHISE_OPTIONS.some((f) => f.id === v)
const isFacility = (v: string): v is FacilitySize => FACILITY_SIZE_OPTIONS.some((f) => f.id === v)
const isSub = (v: string): v is SubCategory => SUB_IDS.includes(v)
const isYearMonth = (v: string | null): v is string => !!v && /^\d{4}-(0[1-9]|1[0-2])$/.test(v)

/** URL 쿼리 → 진단 조건 (잘못된 값은 기본값으로 대체) */
export function parseDiagnosisQuery(params: URLSearchParams): DiagnosisQuery {
  const category = params.get('category')
  const radius = Number(params.get('radius'))
  const franchise = params.get('franchise')
  const asOf = params.get('asOf')
  return {
    address: params.get('address') ?? '',
    category: isCategory(category) ? category : null,
    subCategories: (params.get('sub') ?? '').split(',').filter(isSub),
    radius: isRadius(radius) ? radius : DEFAULT_RADIUS,
    asOf: isYearMonth(asOf) ? asOf : null,
    facilitySizes: (params.get('size') ?? '').split(',').filter(isFacility),
    franchise: isFranchise(franchise) ? franchise : 'all',
  }
}

/** 진단 조건 → URL 쿼리 문자열 (기본값은 생략해 주소를 짧게 유지) */
export function toDiagnosisSearch(q: DiagnosisQuery): string {
  const p = new URLSearchParams()
  if (q.address) p.set('address', q.address)
  if (q.category) p.set('category', q.category)
  if (q.subCategories.length) p.set('sub', q.subCategories.join(','))
  if (q.radius !== DEFAULT_RADIUS) p.set('radius', String(q.radius))
  if (q.asOf) p.set('asOf', q.asOf)
  if (q.facilitySizes.length) p.set('size', q.facilitySizes.join(','))
  if (q.franchise !== 'all') p.set('franchise', q.franchise)
  const s = p.toString()
  return s ? `?${s}` : ''
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

  const isReady = query.address.trim() !== '' && query.category !== null
  return { query, updateQuery, isReady, search: toDiagnosisSearch(query) }
}
