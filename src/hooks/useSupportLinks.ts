import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../api/queryKeys'
import { getSupportLinks } from '../api/support'
import type { SupportLinksParams } from '../types/support'

/** F-10 상담·지원 링크 (자치구·업종으로 정렬 우선순위만 바뀐다) */
export function useSupportLinks(params: SupportLinksParams = {}) {
  return useQuery({
    queryKey: queryKeys.supportLinks(params),
    queryFn: () => getSupportLinks(params),
  })
}
