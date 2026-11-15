import { toDataRangeParams } from '../api/params'
import { getAsOfRangeMessage } from '../constants/messages'
import { useDataRange } from './useDataRange'
import { useDiagnosisQuery } from './useDiagnosisQuery'

/**
 * AS_OF_OUT_OF_RANGE 안내 — BE가 error.detail을 보내지 않으므로 같은 업종 조건의 data-range로 범위를 채운다
 * (BE fe-system-audit-request.md "현재 전달 기준"). 범위 밖 오류가 아니면 null
 */
export function useAsOfRangeMessage(): (error: unknown) => string | null {
  const { query } = useDiagnosisQuery()
  const range = useDataRange(toDataRangeParams(query)).data?.data ?? null
  return (error) => getAsOfRangeMessage(error, range)
}
