import { skipToken, useQuery } from '@tanstack/react-query'
import { getDataRange } from '../api/meta'
import { queryKeys } from '../api/queryKeys'
import { MIN_AS_OF } from '../constants/diagnosis'
import type { DataRangeParams } from '../types/meta'
import { clampMonthRange } from '../utils/date'

/** F-05 시점 선택 가능 범위 (min_month ~ max_month) — 시작은 2010-01부터 (MIN_AS_OF, 끝은 서버 값 그대로) */
export function useDataRange(params: DataRangeParams | null) {
  return useQuery({
    queryKey: queryKeys.dataRange(params),
    queryFn: params ? () => getDataRange(params) : skipToken,
    select: (result) => ({ ...result, data: clampMonthRange(result.data, MIN_AS_OF) }),
  })
}
