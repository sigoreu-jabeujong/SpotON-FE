/** GET /api/market/activity 목업 — 시연용 가상 값 */
import type { ActivityInclude, MarketActivity } from '../../types/market'
import type { ApiSubCategory } from '../../types/stores'
import { DEMO_META, ok, radiusSpace } from './common'
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
 * - include에 없는 조건부 항목 → null + flags.missing
 * - 기준 시점(as_of)이 2025-01 이전 → 추정매출 없음 (상권 데이터 보유본 2025년 1분기~)
 * - 기준 시점이 2021-01 이전 → 생활인구도 없음
 */
export const marketActivityMock: MockHandler = (query) => {
  const include = (query.get('include') ?? '').split(',').filter(Boolean)
  const { space } = radiusSpace(query)
  const stats = storeStats(query)
  const asOf = stats.t
  const t = asOf.slice(0, 7)
  const salesAvailable = include.includes('sales') && t >= '2025-01'
  const livingAvailable = include.includes('living_pop') && t >= '2021-01'
  const missing: ActivityInclude[] = []
  if (!salesAvailable) missing.push('sales')
  if (!livingAvailable) missing.push('living_pop')

  const data: MarketActivity = {
    recent_12m: {
      period: stats.period12m,
      opened: stats.opened12m,
      closed: stats.closed12m,
    },
    yearly_trend: stats.yearly,
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
    flags: { missing },
  }
  return ok(data, { ...DEMO_META, as_of: asOf, space, denominator: stats.openNow.length })
}
