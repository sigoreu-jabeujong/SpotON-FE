import type { CommonQueryParams } from '../types/api'
import type { ActivityInclude, MarketActivity } from '../types/market'
import { apiGet } from './client'

/** F-06 개·폐업 변화와 상권 지표 (GET /api/market/activity) */
export function getMarketActivity(params: CommonQueryParams, include: ActivityInclude[] = []) {
  return apiGet<MarketActivity>('/market/activity', { ...params, include })
}
