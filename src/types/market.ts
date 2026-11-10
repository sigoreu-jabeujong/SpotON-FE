import type { ApiMeta } from './api'
import type { ApiSubCategory } from './stores'

/** /market/activity 선택 항목 */
export type ActivityInclude = 'sales' | 'living_pop'

export type SalesMarket = {
  market_code: string
  market_name: string
  /** 예: "2026-Q2" */
  quarter: string
  est_sales: number
  /** 예: "KRW/quarter" */
  unit: string
}

/** 상권별 추정매출 (조건부). 상권별로 따로 표시 — 합산 금지 */
export type MarketSales = {
  markets: SalesMarket[]
  status: 'estimate'
  meta: ApiMeta | null
}

/** 250m 격자 생활인구 (조건부) */
export type LivingPopulation = {
  date: string
  total: number
  grid_count: number
  missing_grid_count: number
  status: 'estimate'
  meta: ApiMeta | null
}

/** GET /api/market/activity 응답 data */
export type MarketActivity = {
  recent_12m: { period: string; opened: number; closed: number }
  yearly_trend: { year: number; opened: number; closed: number }[]
  by_sub_category: {
    sub_category: ApiSubCategory
    open_count: number
    avg_operating_months: number | null
  }[]
  sales: MarketSales | null
  living_pop: LivingPopulation | null
  /** 자료가 없는 선택 항목 이름 */
  flags: { missing: ActivityInclude[] }
}
