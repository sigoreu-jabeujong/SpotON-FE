import {
  ACTIVITY_INCLUDE,
  toCommonQueryParams,
  toStoreHistoryParams,
  toInterpretHistory,
} from '../api/params'
import { getCoordinates, useDiagnosisQuery } from './useDiagnosisQuery'
import { useMarketActivity } from './useMarketActivity'
import { useCachedInterpretation, useRisk } from './useRisk'
import { useNearbyStores, useStoreHistory, useStoreSnapshot } from './useStores'

/**
 * 진단서(PDF)·요약 이미지에 담을 데이터 — 결과 화면과 같은 쿼리 키를 써서 이미 불러온 캐시를 그대로 쓰고,
 * 없으면 그 자리에서 불러온다. AI 해석은 받아 둔 경우만 (새로 요청하지 않음). 숫자를 새로 계산하지 않는다.
 */
export function useReportData() {
  const { query } = useDiagnosisQuery()
  const coords = getCoordinates(query)
  const params = coords ? toCommonQueryParams(query, coords) : null

  const history = useStoreHistory(toStoreHistoryParams(query))
  const nearby = useNearbyStores(params)
  const snapshot = useStoreSnapshot(params) // 기준 시점(asOf)이 있을 때만 요청됨
  const activity = useMarketActivity(params, ACTIVITY_INCLUDE)
  const risk = useRisk(params)
  const ai = useCachedInterpretation(params, toInterpretHistory(query), query.address)

  const queries = [history, nearby, snapshot, activity, risk]
  return {
    query,
    history,
    nearby,
    snapshot,
    activity,
    risk,
    ai: ai.data?.data ?? null,
    /** 요청 중인 것이 있으면 true (요청하지 않는 쿼리는 제외) */
    loading: queries.some((q) => q.isLoading),
    failed: queries.filter((q) => q.isError),
    retry: () => queries.forEach((q) => q.isError && void q.refetch()),
  }
}
