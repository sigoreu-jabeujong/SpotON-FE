import { skipToken, useQuery } from '@tanstack/react-query'
import { getDataRange } from '../api/meta'
import { queryKeys } from '../api/queryKeys'
import type { DataRangeParams } from '../types/meta'

/** F-05 시점 선택 가능 범위 (min_month ~ max_month) */
export function useDataRange(params: DataRangeParams | null) {
  return useQuery({
    queryKey: queryKeys.dataRange(params),
    queryFn: params ? () => getDataRange(params) : skipToken,
  })
}
