import { skipToken, useQuery } from '@tanstack/react-query'
import { getMarketActivity } from '../api/market'
import { queryKeys } from '../api/queryKeys'
import type { CommonQueryParams } from '../types/api'
import type { ActivityInclude } from '../types/market'

/** F-06 개·폐업 변화와 상권 지표. include로 조건부 항목(sales, living_pop)을 요청 */
export function useMarketActivity(
  params: CommonQueryParams | null,
  include: ActivityInclude[] = [],
) {
  return useQuery({
    queryKey: queryKeys.marketActivity(params, include),
    queryFn: params ? () => getMarketActivity(params, include) : skipToken,
  })
}
