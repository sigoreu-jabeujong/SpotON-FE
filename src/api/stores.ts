import type { CommonQueryParams } from '../types/api'
import type { NearbyStores, StoreHistory, StoreHistoryParams, StoreSnapshot } from '../types/stores'
import { apiGet } from './client'
import { analysisPath, V2_API_ENABLED, validateAnalysisParams } from './analysisProfile'
import { adaptAnalysisHistory, adaptAnalysisNearby, adaptAnalysisSnapshot } from './storeAdapters'
import type {
  AnalysisHistoryResponse,
  AnalysisNearbyResponse,
  AnalysisSnapshotResponse,
} from './storeAdapters'

/** F-02 같은 건물의 과거 점포 이력 (GET /api/stores/history) */
export async function getStoreHistory(params: StoreHistoryParams) {
  if (V2_API_ENABLED) {
    const res = await apiGet<AnalysisHistoryResponse>(analysisPath('/stores/history'), params)
    return { ...res, data: adaptAnalysisHistory(res.data) }
  }
  return apiGet<StoreHistory>('/stores/history', params)
}

/** F-03·F-04 반경 안 동일 업종 점포 (GET /api/stores/nearby) */
export async function getNearbyStores(params: CommonQueryParams) {
  validateAnalysisParams(params)
  if (V2_API_ENABLED) {
    const res = await apiGet<AnalysisNearbyResponse>(analysisPath('/stores/nearby'), params)
    return { ...res, data: adaptAnalysisNearby(res.data) }
  }
  return apiGet<NearbyStores>('/stores/nearby', params)
}

/** F-05 과거 시점 점포의 지금 상태 (GET /api/stores/snapshot). as_of 필수 */
export async function getStoreSnapshot(params: CommonQueryParams & { as_of: string }) {
  validateAnalysisParams(params)
  if (V2_API_ENABLED) {
    const res = await apiGet<AnalysisSnapshotResponse>(analysisPath('/stores/snapshot'), params)
    return { ...res, data: adaptAnalysisSnapshot(res.data) }
  }
  return apiGet<StoreSnapshot>('/stores/snapshot', params)
}
