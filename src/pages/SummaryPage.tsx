import { TriangleAlert } from 'lucide-react'
import { toCommonQueryParams } from '../api/params'
import PastViewNote from '../components/analysis/nearby/PastViewNote'
import Card from '../components/common/Card'
import ErrorState from '../components/common/ErrorState'
import LoadingState from '../components/common/LoadingState'
import AiInterpretation from '../components/summary/ai/AiInterpretation'
import MarketCard from '../components/summary/MarketCard'
import OfficialIndicators from '../components/summary/OfficialIndicators'
import ReferenceIndicators from '../components/summary/ReferenceIndicators'
import SeoulCompare from '../components/summary/SeoulCompare'
import SummaryInfoGrid from '../components/summary/SummaryInfoGrid'
import { getAsOfRangeMessage, MESSAGES } from '../constants/messages'
import { getCoordinates, useDiagnosisQuery } from '../hooks/useDiagnosisQuery'
import { useRisk } from '../hooks/useRisk'

const T = MESSAGES.summary

/**
 * STEP 03 종합 진단 결과 (F-07) — 상권 판정 + 서울시 공식 지표 + Spot:ON 참고지표.
 * 디자인의 "창업 위험도 점수·등급"은 만들지 않는다 (자체 종합 점수·등급 금지, docs/decisions.md)
 */
export default function SummaryPage() {
  const { query, search } = useDiagnosisQuery()
  const coords = getCoordinates(query)
  const params = coords ? toCommonQueryParams(query, coords) : null
  // 상권 활동 섹션과 같은 쿼리 키 → 캐시 공유
  const risk = useRisk(params)

  return (
    <Card className="flex flex-col gap-10">
      <PastViewNote asOf={query.asOf} />
      {risk.isPending ? (
        <LoadingState />
      ) : risk.isError ? (
        <ErrorState
          error={risk.error}
          message={getAsOfRangeMessage(risk.error) ?? undefined}
          onRetry={getAsOfRangeMessage(risk.error) ? undefined : () => void risk.refetch()}
        />
      ) : (
        <>
          {risk.data.data.flags.insufficient_sample && (
            <p
              role="status"
              className="flex items-center gap-2 rounded-control bg-orange-100 px-4 py-3 text-body font-semibold text-orange-700"
            >
              <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
              {T.insufficient}
            </p>
          )}
          <MarketCard market={risk.data.data.market} />
          <OfficialIndicators
            indicators={risk.data.data.indicators}
            market={risk.data.data.market}
            query={risk.data.data.query}
          />
          <ReferenceIndicators indicators={risk.data.data.indicators} />
          <SeoulCompare indicators={risk.data.data.indicators} />
        </>
      )}

      {/* AI 해석 — 지표를 불러온 뒤에만. 조건(search)이 바뀌면 key로 새로 만들어 이전 결과를 지운다 */}
      {risk.data && params && (
        <AiInterpretation
          key={search}
          risk={risk.data.data}
          params={params}
          onReloadIndicators={() => void risk.refetch()}
        />
      )}

      <SummaryInfoGrid meta={risk.data?.meta} />
    </Card>
  )
}
