/** GET /api/market/activity 목업 — 시연용 가상 값 */
import type { ActivityInclude, MarketActivity } from '../../types/market'
import { DEMO_META, isRestaurant, monthEnd, ok, radiusSpace } from './common'
import type { MockHandler } from './index'
import { shiftMonth } from '../../utils/date'

/** 음식점 세부 업종별 목업 값 (avg_operating_months가 null인 업종도 하나 둠 → "정보 없음" 표시 확인) */
const RESTAURANT_SUBS: MarketActivity['by_sub_category'] = [
  { sub_category: 'korean', open_count: 21, avg_operating_months: 52 },
  { sub_category: 'japanese', open_count: 8, avg_operating_months: 33 },
  { sub_category: 'western', open_count: 5, avg_operating_months: null },
]

/**
 * 테스트용 규칙 (실제 데이터 보유 범위를 흉내)
 * - include에 없는 조건부 항목 → null + flags.missing
 * - 기준 시점(as_of)이 2025-01 이전 → 추정매출 없음 (상권 데이터 보유본 2025년 1분기~)
 * - 기준 시점이 2021-01 이전 → 생활인구도 없음
 */
export const marketActivityMock: MockHandler = (query) => {
  const include = (query.get('include') ?? '').split(',').filter(Boolean)
  const { space } = radiusSpace(query)
  const asOfMonth = query.get('as_of')
  const asOf = monthEnd(asOfMonth)
  const t = asOfMonth ?? '2026-10'
  const year = Number(t.slice(0, 4))
  const salesAvailable = include.includes('sales') && t >= '2025-01'
  const livingAvailable = include.includes('living_pop') && t >= '2021-01'
  const missing: ActivityInclude[] = []
  if (!salesAvailable) missing.push('sales')
  if (!livingAvailable) missing.push('living_pop')

  const subs = (query.get('sub_category') ?? '').split(',').filter(Boolean)
  const restaurantSubs = subs.length
    ? RESTAURANT_SUBS.filter((s) => subs.includes(s.sub_category))
    : RESTAURANT_SUBS

  // 기준 시점에 따라 숫자가 조금씩 달라지게 (목업 안에서만)
  const shift = (year % 3) - 1
  const data: MarketActivity = {
    recent_12m: {
      period: `${shiftMonth(t, -11)}~${t}`,
      opened: 6 + shift,
      closed: 8 - shift,
    },
    yearly_trend: [5, 4, 3, 2, 1].map((back, i) => ({
      year: year - back,
      opened: [9, 7, 5, 6, 8][i] + shift,
      closed: [5, 6, 7, 8, 6][i],
    })),
    by_sub_category: isRestaurant(query)
      ? restaurantSubs
      : [{ sub_category: 'cafe', open_count: 38 + shift, avg_operating_months: 41 }],
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
  return ok(data, { ...DEMO_META, as_of: asOf, space, denominator: 46 })
}
