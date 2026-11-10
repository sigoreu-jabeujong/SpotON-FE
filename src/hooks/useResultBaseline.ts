import { toStoreHistoryParams } from '../api/params'
import { formatDataBaseline } from '../utils/format'
import { useDiagnosisQuery } from './useDiagnosisQuery'
import { useStoreHistory } from './useStores'

/**
 * 결과 화면 하단 "데이터 기준일 YYYY.MM.DD (수집 YYYY.MM.DD)" 값.
 * 지금은 /stores/history 응답 meta 기준 (같은 쿼리 키라 이력 섹션과 캐시를 공유해 요청이 늘지 않는다).
 * 다른 API가 생기면 이 훅 안에서만 기준 API를 바꾸면 된다.
 */
export function useResultBaseline(): string | null {
  const { query } = useDiagnosisQuery()
  const history = useStoreHistory(toStoreHistoryParams(query))
  return formatDataBaseline(history.data?.meta)
}
