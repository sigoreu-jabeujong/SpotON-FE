import { Calculator } from 'lucide-react'
import { DATA_STATUS, INDICATOR_NAME } from '../../constants/labels'
import { MESSAGES } from '../../constants/messages'
import type { IndicatorId, MetricIndicator, RiskIndicator } from '../../types/risk'
import MetaLine from '../common/MetaLine'
import IndicatorArea from './IndicatorArea'
import IndicatorCard from './IndicatorCard'
import { formatIndicatorValue, formatSeoulAvg, indicatorGridSpan } from './indicatorFormat'

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
      <ul className="grid grid-cols-6 gap-3">
        {cards.map((ind, i) => (
          <li key={ind.id} className={indicatorGridSpan(i, cards.length)}>
            <ReferenceCard ind={ind} />
          </li>
        ))}
      </ul>
    </IndicatorArea>
  )
}

function ReferenceCard({ ind }: { ind: MetricIndicator }) {
  const value = formatIndicatorValue(ind)
  const seoul = formatSeoulAvg(ind)
  const name = INDICATOR_NAME[ind.id as keyof typeof INDICATOR_NAME] ?? ind.id
  const seoulLine = ind.unit === '%' && (seoul || ind.seoul_avg_reason)
  const fraction = value && ind.numerator != null && ind.denominator != null
  return (
    <IndicatorCard
      id={ind.id}
      icon={Calculator}
      iconClassName="text-gray-600"
      title={name}
      // 값이 없으면 숫자(0) 대신 상태 아이콘과 사유만
      value={value}
      empty={{ status: ind.status, text: ind.reason ?? DATA_STATUS[ind.status].label }}
      details={
        (seoulLine || fraction) && (
          <ul className="flex flex-col gap-0.5">
            {seoulLine && <li>{seoul ? T.seoulAvg(seoul) : ind.seoul_avg_reason}</li>}
            {fraction && <li>{T.fraction(ind.numerator as number, ind.denominator as number)}</li>}
          </ul>
        )
      }
      status={ind.status}
      source={
        <MetaLine
          source={ind.source}
          period={ind.period}
          space={ind.space}
          denominator={ind.denominator}
        />
      }
    />
  )
}
