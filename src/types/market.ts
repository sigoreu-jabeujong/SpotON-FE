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

/**
 * GET /api/market/activity 응답 data (BE docs/fe-market-activity-api-request.md 3장).
 * 기간·평균은 서버 계산값 그대로 — FE가 현재 날짜로 다시 계산하지 않는다.
 */
export type MarketActivity = {
  /** period = "(시작일, 종료일]" 실제 기간 (시작일 제외·종료일 포함). opened/closed = 기간 안 개업·폐업 사건 수 */
  recent_12m: { period: string; opened: number; closed: number }
  /**
   * 연도별 개업·폐업 — 사건 기록이 있는 연도만 (없는 연도를 0으로 채우지 않음).
   * 비교 기간은 meta.yearly_comparison_basis·yearly_periods (같은 월일까지 YTD일 수 있음)
   */
  yearly_trend: { year: number; opened: number; closed: number }[]
  by_sub_category: {
    sub_category: ApiSubCategory
    /** 기준 시점 T에 유효한 인허가 점포 수 */
    open_count: number
    /** 그 점포들이 T까지 경과한 완료 개월의 평균(버림). 0 = 실제 0개월, null = 계산 불가(정보 없음) */
    avg_operating_months: number | null
  }[]
  /** 지금 BE는 항상 null (수치 활성화는 후속) — 사유는 meta.optional_data */
  sales: MarketSales | null
  living_pop: LivingPopulation | null
  /** 요청했지만 미산정인 선택 항목만 (미요청 항목은 넣지 않음) */
  flags: { missing: ActivityInclude[] }
}
