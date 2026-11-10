import { skipToken, useMutation, useQuery } from '@tanstack/react-query'
import { queryKeys } from '../api/queryKeys'
import { getRisk, postRiskInterpret } from '../api/risk'
import type { CommonQueryParams } from '../types/api'
import type { RiskInclude } from '../types/risk'

/** F-07 공식 지표 + 참고지표 */
export function useRisk(params: CommonQueryParams | null, include: RiskInclude[] = []) {
  return useQuery({
    queryKey: queryKeys.risk(params, include),
    queryFn: params ? () => getRisk(params, include) : skipToken,
  })
}

/**
 * F-08 AI 해석. 화면 진입 시 자동 요청하지 않고,
 * 사용자가 "AI 해석 보기"를 눌렀을 때 mutate(요청 본문)로 실행한다.
 * 실패해도 useRisk의 지표는 그대로 남는다.
 */
export function useRiskInterpret() {
  return useMutation({ mutationFn: postRiskInterpret })
}
