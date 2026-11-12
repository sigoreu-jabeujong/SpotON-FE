/** GET /api/market/activity 목업 — 시연용 가상 값 */
import type { ActivityInclude, MarketActivity } from '../../types/market'
import type { ApiSubCategory } from '../../types/stores'
import { DEMO_META, fail, ok, radiusSpace } from './common'
import type { MockHandler } from './index'
import { storeStats } from './nearby'

/** 목업 전용: 지금 영업 중 점포를 세부 업종별로 (점포 수·평균 영업 기간) */
function bySubCategory(stats: ReturnType<typeof storeStats>): MarketActivity['by_sub_category'] {
  const groups = new Map<ApiSubCategory, (number | null)[]>()
  for (const m of stats.openNow) {
    groups.set(m.sub_category, [...(groups.get(m.sub_category) ?? []), m.operating_months])
  }
  return [...groups].map(([sub_category, all]) => {
    // 기간 미산정(null) 점포는 점포 수에는 넣고 평균에서는 뺀다
    const months = all.filter((m): m is number => m !== null)
    return {
      sub_category,
      open_count: all.length,
      // 양식은 "정보 없음" 표시 확인용으로 평균 영업 기간을 비워 둔다 (목업 테스트 규칙)
      avg_operating_months:
        sub_category === 'western' || months.length === 0
          ? null
          : Math.floor(months.reduce((a, b) => a + b, 0) / months.length),
    }
  })
}

/**
 * 테스트용 규칙 (실제 데이터 보유 범위를 흉내)
 * - 점포 수·개폐업 수는 nearby.ts 점포 목록에서 센다 (지도·동종업체 수와 같은 집합)
 * - include에 없는 조건부 항목 → null (flags.missing·optional_data에 넣지 않음 — 실제 BE와 같음)
 * - 기준 시점(as_of)이 2025-01 이전 → 추정매출 없음 (상권 데이터 보유본 2025년 1분기~)
 * - 기준 시점이 2021-01 이전 → 생활인구도 없음
 * - 결과 화면 주소의 bk 또는 address에 "pending" → 실제 BE처럼 추정매출·생활인구 null +
 *   meta.optional_data pending(사유 코드) — "자료 확인 중" 표시 확인용
 * - 연도별 추이는 개·폐업이 있는 연도만 (없는 연도를 0으로 채우지 않음)
 * - meta.denominator는 null (활동 응답 전체의 분모 없음), 가맹 분류는 실제 BE처럼 pending
 */
/** 목업 전용: 화면 주소에 "pending"이 있으면 선택 항목을 실제 BE처럼 확인 중으로 */
function pendingScenario(): boolean {
  if (typeof window === 'undefined') return false
  const q = new URLSearchParams(window.location.search)
  return /pending/i.test(`${q.get('bk') ?? ''} ${q.get('address') ?? ''}`)
}

/** 실제 BE가 지금 보내는 미확인 사유 (요청서 4장) */
const PENDING_REASON: Record<ActivityInclude, string> = {
  sales: 'source_period_and_boundary_unverified',
  living_pop: 'population_aggregation_and_grid_time_unverified',
}

export const marketActivityMock: MockHandler = (query) => {
  const raw = query.get('include')
  const include = (raw ?? '').split(',')
  // 실제 BE: 빈 문자열·빈 토큰·중복·모르는 항목은 422 (미요청이면 파라미터 생략)
  if (
    raw !== null &&
    (include.some((i) => i !== 'sales' && i !== 'living_pop') ||
      new Set(include).size !== include.length)
  )
    return fail(422, 'INVALID_PARAM', '요청 값을 확인해 주세요')
  const { space } = radiusSpace(query)
  const stats = storeStats(query)
  const asOf = stats.t
  const t = asOf.slice(0, 7)
  const pending = pendingScenario()
  const salesAvailable = !pending && include.includes('sales') && t >= '2025-01'
  const livingAvailable = !pending && include.includes('living_pop') && t >= '2021-01'
  // 요청했지만 값이 없는 항목만
  const missing = (['sales', 'living_pop'] as const).filter(
    (k) => include.includes(k) && !(k === 'sales' ? salesAvailable : livingAvailable),
  )
  const optional_data = pending
    ? Object.fromEntries(missing.map((k) => [k, { status: 'pending', reason: PENDING_REASON[k] }]))
    : null

  const data: MarketActivity = {
    recent_12m: {
      period: stats.period12m,
      opened: stats.opened12m,
      closed: stats.closed12m,
    },
    yearly_trend: stats.yearly.filter((y) => y.opened > 0 || y.closed > 0),
    by_sub_category: bySubCategory(stats),
    sales: salesAvailable
      ? {
          markets: [
            {
              market_code: '3110xxx',
              market_name: '○○역 상권',
              quarter: '2026-Q2',
              est_sales: 1520000000,
              unit: 'KRW/quarter',
            },
            {
              market_code: '3110yyy',
              market_name: '○○로 골목상권',
              quarter: '2026-Q2',
              est_sales: 384000000,
              unit: 'KRW/quarter',
            },
          ],
          status: 'estimate',
          meta: { source: ['R3'], as_of: '2026-06-30', space: 'market', denominator: null },
        }
      : null,
    living_pop: livingAvailable
      ? {
          date: '2026-10-15',
          total: 48210,
          grid_count: 13,
          missing_grid_count: 1,
          status: 'estimate',
          meta: { source: ['R4'], as_of: '2026-10-15', space: 'grid', denominator: 13 },
        }
      : null,
    flags: { missing: [...missing] },
  }
  return ok(data, {
    ...DEMO_META,
    as_of: asOf,
    space,
    denominator: null,
    operating_period_basis: 'elapsed_months_of_active_at_as_of',
    franchise_classification: { status: 'pending', reason: 'brand_mapping_blocked' },
    ...(optional_data ? { optional_data } : {}),
  })
}
