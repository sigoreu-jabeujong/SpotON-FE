import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bot, LoaderCircle, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router'
import type { ApiMeta, CommonQueryParams } from '../../../types/api'
import type { AiSectionsReport, ReportBaseline, ReportRequest } from '../../../types/aiReport'
import type { ApiResult } from '../../../api/client'
import { ApiRequestError } from '../../../api/client'
import { postAiReport, reportMatches } from '../../../api/aiReport'
import { ACTIVITY_INCLUDE } from '../../../api/params'
import { queryKeys } from '../../../api/queryKeys'
import { useMarketActivity } from '../../../hooks/useMarketActivity'
import { useLocationReference } from '../../../hooks/useLocationReference'
import { usePopulationReference } from '../../../hooks/usePopulationReference'
import { useLocationHistory } from '../../../hooks/useStores'
import { useDiagnosisQuery } from '../../../hooks/useDiagnosisQuery'
import { closedHistoryParams } from '../../../utils/closedHistory'
import Button from '../../common/Button'
import SubTitle from '../../common/SubTitle'
import InfoPopover from '../../common/InfoPopover'
import { MESSAGES } from '../../../constants/messages'
import { ROUTES } from '../../../constants/routes'
import AiConditions from './AiConditions'
import AiSectionsResult, { ReportChecklist } from './AiSectionsResult'

export default function AiSectionsInterpretation({
  params,
  address,
  meta,
  basisLoading = false,
}: {
  params: CommonQueryParams
  address: string
  meta?: ApiMeta | null
  basisLoading?: boolean
}) {
  const { query } = useDiagnosisQuery()
  const page = useLocation()
  const printing = page.pathname === ROUTES.report
  const activity = useMarketActivity(params, ACTIVITY_INCLUDE, !printing)
  const reference = useLocationReference(params, !printing)
  const grid = usePopulationReference(params, !printing)
  const historyParams = closedHistoryParams(query)
  const history = useLocationHistory(historyParams, !printing)
  const client = useQueryClient()
  const controller = useRef<AbortController | null>(null)
  const [refreshes, setRefreshes] = useState(0)
  const [contextChanged, setContextChanged] = useState(false)
  const region = useRef<HTMLDivElement | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  const historyRequested = historyParams !== null
  const baseline = useMemo<ReportBaseline>(() => {
    return {
      risk: meta?.ai_report_basis_token ?? '',
      activity: activity.data?.meta?.ai_report_basis_token ?? '',
      location: reference.data?.meta?.ai_report_basis_token ?? '',
      grid: grid.data?.meta?.ai_report_basis_token ?? '',
      address_history: historyRequested ? (history.data?.meta?.ai_report_basis_token ?? '') : null,
    }
  }, [
    meta?.ai_report_basis_token,
    activity.data?.meta?.ai_report_basis_token,
    reference.data?.meta?.ai_report_basis_token,
    grid.data?.meta?.ai_report_basis_token,
    historyRequested,
    history.data?.meta?.ai_report_basis_token,
  ])
  const queries = [activity, reference, grid, ...(historyParams ? [history] : [])]
  const ready =
    !basisLoading &&
    queries.every((q) => !q.isFetching && !q.isError) &&
    Object.values(baseline).every((v) => v === null || /^[0-9a-f]{64}$/.test(v)) &&
    (!historyParams || !!history.data?.meta?.ai_report_address_context)
  const key = ['ai-sections-v2', params, address, baseline] as const
  const cached = useQuery<ApiResult<AiSectionsReport>>({
    queryKey: key,
    queryFn: skipToken,
    staleTime: Infinity,
  })
  const liveBaseline = useRef(baseline)
  useEffect(() => {
    liveBaseline.current = baseline
  }, [baseline])
  const mutation = useMutation({
    retry: false,
    mutationFn: ({ body, signal }: { body: ReportRequest; signal: AbortSignal }) =>
      postAiReport(body, signal),
  })
  useEffect(() => {
    if (mutation.isPending) region.current?.focus()
  }, [mutation.isPending])
  const request = () => {
    if (!ready || mutation.isPending || controller.current || printing) return
    const requestController = new AbortController()
    controller.current = requestController
    setContextChanged(false)
    const body: ReportRequest = {
      query: params,
      baseline,
      time_mode: 'latest_reference',
      ...(historyParams && history.data?.meta?.ai_report_address_context
        ? { address_history: history.data.meta.ai_report_address_context }
        : {}),
    }
    mutation.mutate(
      { body, signal: requestController.signal },
      {
        onSuccess: (result) => {
          if (requestController.signal.aborted) return
          if (reportMatches(result.data, liveBaseline.current)) {
            client.setQueryData(key, result)
            setRefreshes(0)
          } else setContextChanged(true)
        },
        onSettled: () => {
          if (controller.current === requestController) controller.current = null
        },
      },
    )
  }
  const result =
    !mutation.isPending &&
    !mutation.isError &&
    !contextChanged &&
    cached.data &&
    reportMatches(cached.data.data, baseline)
      ? cached.data.data
      : undefined
  const error = contextChanged
    ? 'AI_CONTEXT_CHANGED'
    : mutation.error instanceof ApiRequestError
      ? mutation.error.code
      : undefined
  const hasError = mutation.isError || contextChanged
  const refresh = () => {
    // Refresh data only; never automatically POST or reload the page.
    if (error === 'AI_CONTEXT_CHANGED' && refreshes >= 1) return
    if (error === 'AI_CONTEXT_CHANGED') setRefreshes((v) => v + 1)
    void Promise.all([
      activity.refetch(),
      reference.refetch(),
      grid.refetch(),
      ...(historyParams ? [history.refetch()] : []),
      client.invalidateQueries({ queryKey: queryKeys.risk(params, []) }),
    ]).then(() => {
      setContextChanged(false)
      mutation.reset()
    })
  }
  return (
    <section aria-labelledby="ai-title" className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center gap-1">
        <SubTitle id="ai-title" as="h2">
          <span className="inline-flex items-center gap-1.5">
            <Bot className="size-4 text-blue-500" aria-hidden="true" />
            AI 해석
          </span>
        </SubTitle>
        <InfoPopover
          triggerLabel="AI 해석 자료와 한계"
          title="AI 해석 자료와 한계"
          closeLabel="닫기"
        >
          <span className="block">
            공공데이터를 바탕으로 이점·유의점과 수치 해석을 정리해요. 저장된 결과와 PDF에는 같은
            해석을 보여드려요.
          </span>
          <span className="block">
            공공데이터의 시점·공간·누락 한계가 있으며 실제 매출·방문객이나 창업 성공을 예측하지
            않아요.
          </span>
        </InfoPopover>
      </div>
      <AiConditions
        address={address}
        params={params}
        asOf={meta?.as_of}
        dataUpdatedAt={meta?.data_updated_at}
      />
      {result ? (
        <>
          <p role="status" className="sr-only">
            AI 해석을 불러왔어요.
          </p>
          <AiSectionsResult key={result.generated_at} report={result} />
          {result.status === 'partial' && !printing && (
            <Button variant="secondary" onClick={request} disabled={!ready}>
              전체 해석 다시 생성
            </Button>
          )}
        </>
      ) : (
        <div
          ref={region}
          tabIndex={-1}
          className="min-w-0 rounded-card bg-gray-0 p-5 shadow-card focus:outline-none sm:p-7"
        >
          {mutation.isPending ? (
            <div role="status" aria-live="polite" className="flex flex-col gap-5">
              <p className="flex items-center gap-2 text-body text-blue-700">
                <LoaderCircle aria-hidden="true" className="size-5 motion-safe:animate-spin" />
                이점·유의점과 수치 해석을 정리하고 있어요.
              </p>
              <div aria-hidden="true" className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="h-32 rounded-control bg-gray-100" />
                <div className="h-32 rounded-control bg-gray-100" />
              </div>
              <div aria-hidden="true" className="h-24 rounded-control bg-gray-100" />
            </div>
          ) : (
            <>
              {hasError ? (
                <div role="alert" className="mb-4 text-body text-gray-900">
                  <p>
                    {error === 'AI_HISTORY_CONTEXT_OUTDATED'
                      ? '주소를 다시 확인해 주세요. 새 해석을 위해 주소 확인을 갱신해야 해요.'
                      : error === 'AI_CONTEXT_CHANGED'
                        ? '기준 자료가 변경됐어요. 자료를 다시 불러온 뒤 해석 보기를 눌러 주세요.'
                        : MESSAGES.ai.unavailable}
                  </p>
                  {error === 'AI_HISTORY_CONTEXT_OUTDATED' && (
                    <Link
                      to={{ pathname: ROUTES.input, search: page.search }}
                      className="inline-flex min-h-11 items-center underline"
                    >
                      주소 확인하기
                    </Link>
                  )}
                  {error === 'AI_CONTEXT_CHANGED' && refreshes >= 1 && (
                    <Link
                      to={{ pathname: ROUTES.input, search: page.search }}
                      className="inline-flex min-h-11 items-center underline"
                    >
                      조건 다시 확인하기
                    </Link>
                  )}
                </div>
              ) : (
                <p className="mb-4 text-body text-gray-900">
                  이 주소의 이점과 유의점을 살펴보고, 공공데이터 수치를 함께 정리해 드려요.
                </p>
              )}
              {printing ? (
                <p className="text-caption text-gray-600">{MESSAGES.ai.printNotRequested}</p>
              ) : (
                <div className="flex flex-wrap items-center gap-3 print:hidden">
                  <Button
                    variant="secondary"
                    onClick={request}
                    disabled={
                      !ready ||
                      error === 'AI_CONTEXT_CHANGED' ||
                      error === 'AI_HISTORY_CONTEXT_OUTDATED'
                    }
                    iconRight={<Sparkles className="size-3.5" />}
                    className="shrink-0 gap-1.5! px-3.5! text-caption! whitespace-nowrap ring-blue-500! disabled:ring-0!"
                  >
                    {hasError ? '다시 시도' : MESSAGES.ai.start}
                  </Button>
                  {(!ready || error === 'AI_CONTEXT_CHANGED') && (
                    <Button
                      variant="secondary"
                      onClick={refresh}
                      disabled={error === 'AI_CONTEXT_CHANGED' && refreshes >= 1}
                    >
                      자료 다시 불러오기
                    </Button>
                  )}
                </div>
              )}
              {!ready && (
                <p className="mt-3 text-caption text-gray-600">
                  AI 해석용 기준 자료를 확인하고 있어요. 조회가 실패했다면 자료를 다시 불러온 후
                  시도해 주세요.
                </p>
              )}
            </>
          )}
          {!mutation.isIdle && <ReportChecklist />}
        </div>
      )}
    </section>
  )
}
