import { skipToken, useQuery } from '@tanstack/react-query'
import { getGeocode } from '../api/geocode'
import { queryKeys } from '../api/queryKeys'
import type { GeocodeParams } from '../types/geocode'

/** F-01 주소 검색. params가 null이면 요청하지 않는다 (예: "진단하기" 누르기 전) */
export function useGeocode(params: GeocodeParams | null) {
  return useQuery({
    queryKey: queryKeys.geocode(params),
    queryFn: params ? () => getGeocode(params) : skipToken,
  })
}
