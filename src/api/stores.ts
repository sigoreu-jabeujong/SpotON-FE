import type { CommonQueryParams } from '../types/api'
import type { NearbyStores, StoreHistory, StoreHistoryParams, StoreSnapshot } from '../types/stores'
import { apiGet } from './client'

/** F-02 같은 건물의 과거 점포 이력 (GET /api/stores/history) */
export function getStoreHistory(params: StoreHistoryParams) {
  return apiGet<StoreHistory>('/stores/history', params)
}

/** F-03·F-04 반경 안 동일 업종 점포 (GET /api/stores/nearby) */
export function getNearbyStores(params: CommonQueryParams) {
  return apiGet<NearbyStores>('/stores/nearby', params)
}

/** F-05 과거 시점 점포의 지금 상태 (GET /api/stores/snapshot). as_of 필수 */
export function getStoreSnapshot(params: CommonQueryParams & { as_of: string }) {
  return apiGet<StoreSnapshot>('/stores/snapshot', params)
}
