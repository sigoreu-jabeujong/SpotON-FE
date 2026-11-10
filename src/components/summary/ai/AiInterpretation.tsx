import { useQueryClient } from '@tanstack/react-query'
import { Bot, LoaderCircle, Sparkles } from 'lucide-react'
import { ACTIVITY_INCLUDE, toStoreHistoryParams } from '../../../api/params'
import { queryKeys } from '../../../api/queryKeys'
import type { ApiResult } from '../../../api/client'
import { MESSAGES } from '../../../constants/messages'
import { useDiagnosisQuery } from '../../../hooks/useDiagnosisQuery'
import { useRiskInterpret } from '../../../hooks/useRisk'
import type { CommonQueryParams } from '../../../types/api'
import type { MarketActivity } from '../../../types/market'
import type { Risk, RiskInterpretRequest } from '../../../types/risk'
import type { StoreHistory } from '../../../types/stores'
import Button from '../../common/Button'
import SubTitle from '../../common/SubTitle'
import RobotArt from '../../common/RobotArt'
import AiChecklist from './AiChecklist'
import AiFailure from './AiFailure'
import AiResultCard from './AiResultCard'

const T = MESSAGES.ai

type Props = {
  /** /risk 응답 data — 본문에 그대로 넣는다 */
  risk: Risk
  /** 이력·상권 활동 캐시를 찾을 때 쓰는 공통 조회 파라미터 */
  params: CommonQueryParams
  /** 400 INVALID_PARAM일 때 지표를 다시 불러오기 */
  onReloadIndicators: () => void
}

/**
 * STEP 03 AI 해석 (F-08) — "AI 해석 보기"를 눌러야만 POST /risk/interpret를 부른다 (자동 호출 금지).
 * 지표 카드와 독립이라, 실패해도 위쪽 지표는 그대로 남는다.
 * 조건(필터·시점)이 바뀌면 부모가 key를 바꿔 이 컴포넌트를 새로 만든다 → 이전 결과가 지워진다.
 */
export default function AiInterpretation({ risk, params, onReloadIndicators }: Props) {
  const interpret = useRiskInterpret()
  const queryClient = useQueryClient()
  const { query } = useDiagnosisQuery()

  /** 이미 불러온 서버 값만 요약해 context로 보낸다 (새로 요청하거나 숫자를 만들지 않음) */
  const buildContext = (): RiskInterpretRequest['context'] => {
    const historyParams = toStoreHistoryParams(query)
    const history = historyParams
      ? queryClient.getQueryData<ApiResult<StoreHistory>>(queryKeys.storeHistory(historyParams))
      : undefined
    const activity = queryClient.getQueryData<ApiResult<MarketActivity>>(
      queryKeys.marketActivity(params, ACTIVITY_INCLUDE),
    )
    const context: Record<string, number | string | null> = {}
    if (history) context.history_total = history.data.total
    if (activity) {
      context.recent_12m_period = activity.data.recent_12m.period
      context.recent_12m_opened = activity.data.recent_12m.opened
      context.recent_12m_closed = activity.data.recent_12m.closed
    }
    return Object.keys(context).length > 0 ? context : undefined
  }

  const request = () => {
    const body: RiskInterpretRequest = {
      query: risk.query,
      market: risk.market,
      indicators: risk.indicators,
      flags: risk.flags,
    }
    const context = buildContext()
    interpret.mutate(context ? { ...body, context } : body, {
      onSuccess: (res) => {
        // 검증을 통과한 해석만 같은 조건 키로 저장 → 진단서(PDF)에서 다시 요청하지 않고 쓴다
        if (res.data.verification.passed !== false)
          queryClient.setQueryData(queryKeys.riskInterpretation(params), res)
      },
      onError: (error) => {
        // 서버 재계산 값과 맞지 않으면 지표를 다시 불러와 최신 값으로 다시 시도하게 한다
        if (typeof error === 'object' && 'code' in error && error.code === 'INVALID_PARAM')
          onReloadIndicators()
      },
    })
  }

  const result = interpret.data?.data
  const verified = result?.verification.passed !== false

  return (
    <section aria-labelledby="ai-title" className="flex flex-col gap-3">
      <SubTitle id="ai-title">
        <span className="inline-flex items-center gap-1.5">
          <Bot className="size-4 text-blue-500" aria-hidden="true" />
          {result?.label ?? MESSAGES.summary.aiTitle}
        </span>
      </SubTitle>

      {interpret.isIdle && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-blue-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <RobotArt className="size-20" />
            <p className="text-body text-gray-900">{T.intro}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-micro text-gray-600">{T.startNotice}</span>
            <Button onClick={request} iconRight={<Sparkles className="size-4" />}>
              {T.start}
            </Button>
          </div>
        </div>
      )}

      {interpret.isPending && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-center gap-2 rounded-card bg-blue-100 px-6 py-8 text-body text-blue-700"
        >
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          {T.loading}
        </div>
      )}

      {(interpret.isError || (result && !verified)) && (
        <AiFailure error={interpret.error} verifyFailed={!!result && !verified} onRetry={request} />
      )}

      {result && verified && (
        <AiResultCard result={result} checklist={<AiChecklist items={result.checklist} />} />
      )}
    </section>
  )
}
