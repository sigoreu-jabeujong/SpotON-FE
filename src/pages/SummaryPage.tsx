import { TriangleAlert } from 'lucide-react'
import { useAsOfRangeMessage } from '../hooks/useAsOfRangeMessage'
import { toCommonQueryParams } from '../api/params'
import PastViewNote from '../components/analysis/nearby/PastViewNote'
import Card from '../components/common/Card'
import ErrorState from '../components/common/ErrorState'
import FranchiseFilterNotice from '../components/common/FranchiseFilterNotice'
import SectionErrorBoundary from '../components/common/SectionErrorBoundary'
import LoadingSkeleton from '../components/common/Skeleton'
import Reveal from '../components/common/Reveal'
import AiInterpretation from '../components/summary/ai/AiInterpretation'
import MarketCard from '../components/summary/MarketCard'
import OfficialIndicators from '../components/summary/OfficialIndicators'
import ReferenceIndicators from '../components/summary/ReferenceIndicators'
import SeoulCompare from '../components/summary/SeoulCompare'
import SummaryInfoGrid from '../components/summary/SummaryInfoGrid'
import { MESSAGES } from '../constants/messages'
import { getCoordinates, useDiagnosisQuery } from '../hooks/useDiagnosisQuery'
import { useRisk } from '../hooks/useRisk'

const T = MESSAGES.summary

/**
 * STEP 03 종합 진단 결과 (F-07) — 상권 판정 + 서울시 공식 지표 + Spot:ON 참고지표.
 * 디자인의 "창업 위험도 점수·등급"은 만들지 않는다 (자체 종합 점수·등급 금지, docs/decisions.md)
 */
export default function SummaryPage() {
  const { query, search } = useDiagnosisQuery()
  const asOfRangeMessage = useAsOfRangeMessage()
  const coords = getCoordinates(query)
  const params = coords ? toCommonQueryParams(query, coords) : null
  // 상권 활동 섹션과 같은 쿼리 키 → 캐시 공유
  const risk = useRisk(params)
  // 실제 응답에서 목록이 null로 와도 카드가 멈추지 않게 (값은 바꾸지 않음)
  const indicators = risk.data?.data.indicators ?? []

  return (
    <Card className="flex flex-col gap-10">
      <PastViewNote asOf={query.asOf} />
      {risk.isPending ? (
        <LoadingSkeleton variant="summary" />
      ) : risk.isError ? (
        <ErrorState
          error={risk.error}
          message={asOfRangeMessage(risk.error) ?? undefined}
          onRetry={asOfRangeMessage(risk.error) ? undefined : () => void risk.refetch()}
        />
      ) : (
        <>
          {risk.data.data.flags?.insufficient_sample && (
            <p
              role="status"
              className="flex items-center gap-2 rounded-control bg-orange-100 px-4 py-3 text-body font-semibold text-orange-700"
            >
              <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
              {T.insufficient}
            </p>
          )}
          {/* 가맹 필터 지표는 목록명 일치로 고른 점포의 계산 — 당시 실제 프랜차이즈 코호트 아님 (요청서 5장) */}
          <FranchiseFilterNotice franchise={query.franchise} meta={risk.data.meta} />
          {/* 카드 묶음마다 오류 경계 — 하나가 깨져도 다른 지표는 계속 보인다 */}
          <Reveal>
            <SectionErrorBoundary resetKey={search}>
              <MarketCard market={risk.data.data.market} />
            </SectionErrorBoundary>
          </Reveal>
          <Reveal>
            <SectionErrorBoundary resetKey={search}>
              <OfficialIndicators
                indicators={indicators}
                market={risk.data.data.market}
                query={risk.data.data.query}
              />
            </SectionErrorBoundary>
          </Reveal>
          <Reveal>
            <SectionErrorBoundary resetKey={search}>
              <ReferenceIndicators indicators={indicators} />
            </SectionErrorBoundary>
          </Reveal>
          <Reveal>
            <SectionErrorBoundary resetKey={search}>
              <SeoulCompare indicators={indicators} />
            </SectionErrorBoundary>
          </Reveal>
        </>
      )}

      {/* AI 해석 — 지표를 불러온 뒤에만. 조건(search)이 바뀌면 key로 새로 만들어 이전 결과를 지운다 */}
      {risk.data && params && (
        <Reveal>
          <SectionErrorBoundary resetKey={search}>
            {/* 본문은 조회 조건(params)만 — 서버가 같은 조건으로 다시 계산한다 */}
            <AiInterpretation key={search} params={params} />
          </SectionErrorBoundary>
        </Reveal>
      )}

      <SectionErrorBoundary resetKey={search}>
        <SummaryInfoGrid meta={risk.data?.meta} />
      </SectionErrorBoundary>
    </Card>
  )
}
