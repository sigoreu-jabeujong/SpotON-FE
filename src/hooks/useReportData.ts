import {
  ACTIVITY_INCLUDE,
  toCommonQueryParams,
  toStoreHistoryParams,
  toInterpretHistory,
} from '../api/params'
import { getCoordinates, useDiagnosisQuery } from './useDiagnosisQuery'
import { useMarketActivity } from './useMarketActivity'
import { usePopulationReference } from './usePopulationReference'
import { useCachedInterpretation, useRisk } from './useRisk'
import { useNearbyStores, useStoreHistory, useStoreSnapshot } from './useStores'
import { BRAND_API_ENABLED } from '../api/analysisProfile'
import { interpretationMatches } from '../api/interpretationContext'

/**
 * 진단서(PDF)·요약 이미지에 담을 데이터 — 결과 화면과 같은 쿼리 키를 써서 이미 불러온 캐시를 그대로 쓰고,
 * 없으면 그 자리에서 불러온다. AI 해석은 받아 둔 경우만 (새로 요청하지 않음). 숫자를 새로 계산하지 않는다.
 */
export function useReportData(includePopulation = false) {
  const { query } = useDiagnosisQuery()
  const unsupported = !BRAND_API_ENABLED && query.brandUrlNotice === 'unsupported_brand'
  const coords = getCoordinates(query)
  const params = coords && !unsupported ? toCommonQueryParams(query, coords) : null

  const history = useStoreHistory(unsupported ? null : toStoreHistoryParams(query))
  const nearby = useNearbyStores(params)
  const snapshot = useStoreSnapshot(params) // 기준 시점(asOf)이 있을 때만 요청됨
  const activity = useMarketActivity(params, ACTIVITY_INCLUDE)
  const risk = useRisk(params)
  const populationEnabled = includePopulation && params !== null
  const population = usePopulationReference(populationEnabled ? params : null)
  const ai = useCachedInterpretation(
    params,
    toInterpretHistory(query),
    query.address,
    risk.data?.meta,
  )

  const queries = [history, nearby, snapshot, activity, risk]
  const loading = queries.some((q) => q.isLoading || (BRAND_API_ENABLED && q.isFetching))
  return {
    query,
    history,
    nearby,
    snapshot,
    activity,
    risk,
    population,
    populationEnabled,
    /** Keep core results visible; the print button waits for the optional comparison too. */
    captureLoading: loading || (populationEnabled && population.isFetching),
    ai:
      ai.data &&
      (!BRAND_API_ENABLED ||
        (params &&
          !risk.isFetching &&
          !risk.isError &&
          interpretationMatches(ai.data, params, risk.data?.meta)))
        ? ai.data.data
        : null,
    /** 요청 중인 것이 있으면 true (요청하지 않는 쿼리는 제외) */
    loading,
    failed: queries.filter((q) => q.isError),
    retry: () => queries.forEach((q) => q.isError && void q.refetch()),
  }
}
