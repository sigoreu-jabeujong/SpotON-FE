/** GET /api/market/activity 목업 — 시연용 가상 값 */
import type { ActivityInclude, MarketActivity } from '../../types/market'
import { DEMO_META, isRestaurant, monthEnd, ok, radiusSpace } from './common'
import type { MockHandler } from './index'

/** include에 없는 조건부 항목은 null + flags.missing 으로 응답 (자료 없음 화면 확인용) */
export const marketActivityMock: MockHandler = (query) => {
  const include = (query.get('include') ?? '').split(',').filter(Boolean)
  const { space } = radiusSpace(query)
  const asOf = monthEnd(query.get('as_of'))
  const missing: ActivityInclude[] = []
  if (!include.includes('sales')) missing.push('sales')
  if (!include.includes('living_pop')) missing.push('living_pop')

  const data: MarketActivity = {
    recent_12m: { period: '2025-11~2026-10', opened: 6, closed: 8 },
    yearly_trend: [
      { year: 2022, opened: 9, closed: 5 },
      { year: 2023, opened: 7, closed: 6 },
      { year: 2024, opened: 5, closed: 7 },
      { year: 2025, opened: 6, closed: 8 },
    ],
    by_sub_category: isRestaurant(query)
      ? [
          { sub_category: 'korean', open_count: 21, avg_operating_months: 52 },
          { sub_category: 'chinese', open_count: 6, avg_operating_months: 47 },
          { sub_category: 'japanese', open_count: 8, avg_operating_months: 33 },
          { sub_category: 'western', open_count: 5, avg_operating_months: null },
        ]
      : [{ sub_category: 'cafe', open_count: 38, avg_operating_months: 41 }],
    sales: missing.includes('sales')
      ? null
      : {
          markets: [
            {
              market_code: '3110xxx',
              market_name: '○○역 상권',
              quarter: '2026-Q2',
              est_sales: 1520000000,
              unit: 'KRW/quarter',
            },
          ],
          status: 'estimate',
          meta: { source: ['R3'], as_of: '2026-06-30', space: 'market', denominator: null },
        },
    living_pop: missing.includes('living_pop')
      ? null
      : {
          date: '2026-10-15',
          total: 48210,
          grid_count: 13,
          missing_grid_count: 1,
          status: 'estimate',
          meta: { source: ['R4'], as_of: '2026-10-15', space: 'grid', denominator: 13 },
        },
    flags: { missing },
  }
  return ok(data, { ...DEMO_META, as_of: asOf, space, denominator: 46 })
}
