import { skipToken, useQuery } from '@tanstack/react-query'
import { queryKeys } from '../api/queryKeys'
import { getNearbyStores, getStoreHistory, getStoreSnapshot } from '../api/stores'
import type { CommonQueryParams } from '../types/api'
import type { StoreHistoryParams } from '../types/stores'

/** F-02 과거 점포 이력. params가 null이면 요청하지 않는다 */
export function useStoreHistory(params: StoreHistoryParams | null) {
  return useQuery({
    queryKey: queryKeys.storeHistory(params),
    queryFn: params ? () => getStoreHistory(params) : skipToken,
  })
}

/** F-03·F-04 반경 안 동일 업종 점포 */
export function useNearbyStores(params: CommonQueryParams | null) {
  return useQuery({
    queryKey: queryKeys.nearbyStores(params),
    queryFn: params ? () => getNearbyStores(params) : skipToken,
  })
}

/** F-05 시점 조회. 기준 시점(as_of)이 있을 때만 요청한다 */
export function useStoreSnapshot(params: CommonQueryParams | null) {
  const asOf = params?.as_of
  return useQuery({
    queryKey: queryKeys.storeSnapshot(params),
    queryFn: params && asOf ? () => getStoreSnapshot({ ...params, as_of: asOf }) : skipToken,
  })
}
