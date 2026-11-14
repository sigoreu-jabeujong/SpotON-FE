import { useQueryClient } from '@tanstack/react-query'
import { Bot, LoaderCircle, Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { toRiskInterpretRequest } from '../../../api/params'
import { queryKeys } from '../../../api/queryKeys'
import { MESSAGES } from '../../../constants/messages'
import { useRiskInterpret } from '../../../hooks/useRisk'
import type { ApiMeta, CommonQueryParams } from '../../../types/api'
import type {
  RiskInterpretation,
  RiskInterpretHistory,
  RiskInterpretRequest,
} from '../../../types/risk'
import Button from '../../common/Button'
import SubTitle from '../../common/SubTitle'
import RobotArt from '../../common/RobotArt'
import AiInfoPopover from './AiInfoPopover'
import AiConditions from './AiConditions'
import AiFailure from './AiFailure'
import AiResultCard from './AiResultCard'

const T = MESSAGES.ai

type Props = {
  /** 화면이 Risk GET에 쓴 원래 조회 조건 — AI 본문에 그대로 넣는다 (Risk 응답·화면 수치는 보내지 않음) */
  params: CommonQueryParams
  /** 선택 이력 문맥 (BE #98) — URL의 bk·floor. 건물 키가 없으면 undefined */
  history?: RiskInterpretHistory
  address: string
  meta?: ApiMeta | null
}

/**
 * STEP 03 AI 해석 (F-08) — "AI 해석 보기"를 눌러야만 POST /risk/interpret를 부른다 (자동 호출 금지).
 * 서버가 같은 조건으로 Risk를 다시 계산해 문장을 조립하므로, query에는 조회 조건만 보낸다.
 * 이력 문맥은 별도 history 키(건물 키·층)로만 보낸다 (BE #98, 없으면 생략).
 * 지표 카드와 독립이라 실패해도 위쪽 지표는 그대로 남는다. 다시 시도는 사용자 버튼으로만.
 * 조건(필터·시점)이 바뀌면 부모가 key를 바꿔 이 컴포넌트를 새로 만든다 → 이전 결과·진행 중 요청 결과가 보이지 않는다.
 */
export default function AiInterpretation({ params, history, address, meta }: Props) {
  const interpret = useRiskInterpret()
  const queryClient = useQueryClient()
  const activeRequest = useRef<AbortController | null>(null)
  useEffect(() => () => activeRequest.current?.abort(), [])
  // 키보드: "AI 해석 보기"·"다시 시도"를 누르면 그 버튼이 사라지므로 포커스를 결과 영역으로 옮긴다 (본문 처음으로 튀지 않게)
  const regionRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (interpret.isPending) regionRef.current?.focus()
  }, [interpret.isPending])

  const request = () => {
    if (interpret.isPending) return
    // Risk GET과 같은 조건 그대로 (lat·lng·category·radius·sub_category·as_of(있을 때만)·area·franchise·include_unknown_area·include_unknown_franchise).
    // Risk GET에 include를 쓰지 않으므로 여기서도 넣지 않는다. 건물 키·층·주소는 보내지 않는다.
    // 이력 문맥(BE #98)은 query 밖 history 키로만 — 건물 키가 없으면 생략
    const body: RiskInterpretRequest = toRiskInterpretRequest(params, history)
    const controller = new AbortController()
    activeRequest.current = controller
    interpret.mutate(
      { body, signal: controller.signal },
      {
        onSuccess: (res) => {
          // 검증을 통과한 해석만 같은 조건 키로 저장 → 진단서(PDF)에서 다시 요청하지 않고 쓴다
          if (res.data.verification.passed === true && res.data.body?.trim())
            queryClient.setQueryData(queryKeys.riskInterpretation(params, history, address), res)
        },
        // 실패해도 지표는 그대로, 자동 재호출 없음 (422는 입력 형식 오류 — AiFailure가 안내)
      },
    )
  }

  const result = interpret.data?.data
  const verified = result?.verification.passed === true && !!result.body?.trim()

  return (
    <section aria-labelledby="ai-title" className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        <SubTitle id="ai-title" as="h2">
          <span className="inline-flex items-center gap-1.5">
            <Bot className="size-4 text-blue-500" aria-hidden="true" />
            {result?.label ?? MESSAGES.summary.aiTitle}
          </span>
        </SubTitle>
        <AiInfoPopover result={verified ? result : undefined} meta={meta} />
      </div>
      <AiConditions
        address={address}
        params={params}
        asOf={result?.evidence?.as_of ?? meta?.as_of}
        dataUpdatedAt={result?.evidence?.data_updated_at ?? meta?.data_updated_at}
      />

      {interpret.isIdle && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-gray-0 px-6 py-5 shadow-card">
          <div className="flex items-center gap-3">
            {/* 장식이라 아이콘 크기로 — 설명 문장이 먼저 보이게 */}
            <RobotArt className="size-10" />
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

      {!interpret.isIdle && (
        <div ref={regionRef} tabIndex={-1} className="flex flex-col gap-3 focus:outline-none">
          <AiOutcome interpret={interpret} result={result} verified={verified} onRetry={request} />
        </div>
      )}
    </section>
  )
}

/** 요청 뒤 영역 — 생성 중(status) / 실패(alert) / 결과(도착을 화면 읽기 프로그램에 한 번 알림) */
function AiOutcome({
  interpret,
  result,
  verified,
  onRetry,
}: {
  interpret: ReturnType<typeof useRiskInterpret>
  result: RiskInterpretation | undefined
  verified: boolean
  onRetry: () => void
}) {
  return (
    <>
      {interpret.isPending && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-center gap-2 rounded-card bg-gray-0 px-6 py-8 text-body text-blue-700 shadow-card"
        >
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          {T.loading}
        </div>
      )}

      {(interpret.isError || (result && !verified)) && (
        <AiFailure error={interpret.error} verifyFailed={!!result && !verified} onRetry={onRetry} />
      )}

      {result && verified && (
        <>
          <p role="status" className="sr-only">
            {T.loadedAnnounce}
          </p>
          <AiResultCard result={result} />
        </>
      )}
    </>
  )
}
