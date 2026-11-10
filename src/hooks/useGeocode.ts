import { skipToken, useMutation, useQuery } from '@tanstack/react-query'
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

/**
 * F-01 주소 검색 — 버튼·Enter로 실행하는 방식 (입력 화면용)
 * 같은 주소를 다시 눌러도 매번 결과를 받아 이동할 수 있도록 mutation으로 둔다.
 * 4xx 오류(주소 없음·서울 외)는 재시도하지 않는다 (mutation 기본값: 재시도 없음).
 */
export function useGeocodeSearch() {
  return useMutation({ mutationFn: getGeocode })
}
