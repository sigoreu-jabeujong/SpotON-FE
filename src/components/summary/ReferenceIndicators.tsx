import { Calculator } from 'lucide-react'
import { INDICATOR_NAME } from '../../constants/labels'
import { MESSAGES } from '../../constants/messages'
import type { IndicatorId, MetricIndicator, RiskIndicator } from '../../types/risk'
import MetaLine from '../common/MetaLine'
import StatusLabel from '../common/StatusLabel'
import IndicatorArea from './IndicatorArea'
import { formatIndicatorValue, formatSeoulAvg, indicatorAnchorId } from './indicatorFormat'

const T = MESSAGES.summary

/** 참고지표 영역에 보여줄 지표와 순서. LQ 등 범위 밖 id가 응답에 있어도 무시한다 */
const REFERENCE_IDS: IndicatorId[] = [
  'closure_rate_12m',
  'survival_rate_1y',
  'survival_rate_3y',
  'competitor_count',
  'day_night_ratio',
]

/** Spot:ON 참고지표 영역 — 등급 색 없이 중립 카드 + 상태 라벨 */
export default function ReferenceIndicators({ indicators }: { indicators: RiskIndicator[] }) {
  const cards = REFERENCE_IDS.map((id) =>
    indicators.find((i): i is MetricIndicator => i.id === id && i.type === 'reference'),
  ).filter((i): i is MetricIndicator => !!i)

  return (
    <IndicatorArea type="reference" title={T.referenceTitle} description={T.referenceDescription}>
      <div className="grid grid-cols-3 gap-3">
        {cards.map((ind) => (
          <ReferenceCard key={ind.id} ind={ind} />
        ))}
      </div>
    </IndicatorArea>
  )
}

function ReferenceCard({ ind }: { ind: MetricIndicator }) {
  const value = formatIndicatorValue(ind)
  const seoul = formatSeoulAvg(ind)
  const name = INDICATOR_NAME[ind.id as keyof typeof INDICATOR_NAME] ?? ind.id
  return (
    <article
      id={indicatorAnchorId(ind.id)}
      tabIndex={-1}
      className="flex scroll-mt-8 flex-col gap-2 rounded-control border border-gray-300 bg-gray-0 p-5 focus:outline-2 focus:outline-blue-500"
    >
      <h3 className="flex items-center gap-1.5 text-body font-bold text-gray-900">
        <Calculator className="size-4 text-gray-600" aria-hidden="true" />
        {name}
      </h3>
      {/* 값이 없으면 숫자(0) 대신 상태 라벨과 사유만 */}
      {value ? (
        <p className="text-title font-bold text-gray-900">{value}</p>
      ) : (
        <StatusLabel status={ind.status} reason={ind.reason} />
      )}
      <ul className="flex flex-col gap-0.5 text-caption text-gray-600">
        {ind.unit === '%' && (seoul || ind.seoul_avg_reason) && (
          <li>{seoul ? T.seoulAvg(seoul) : ind.seoul_avg_reason}</li>
        )}
        {value && ind.numerator != null && ind.denominator != null && (
          <li>{T.fraction(ind.numerator, ind.denominator)}</li>
        )}
      </ul>
      {value && <StatusLabel status={ind.status} reason={ind.reason} />}
      <MetaLine
        source={ind.source}
        period={ind.period}
        space={ind.space}
        denominator={ind.denominator}
      />
    </article>
  )
}
