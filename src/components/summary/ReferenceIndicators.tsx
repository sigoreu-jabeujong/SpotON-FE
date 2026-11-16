import { Calculator } from 'lucide-react'
import { IMAGES } from '../../assets/images'
import { DATA_STATUS, INDICATOR_NAME } from '../../constants/labels'
import { MESSAGES } from '../../constants/messages'
import type { IndicatorId, MetricIndicator, RiskIndicator } from '../../types/risk'
import MetaLine from '../common/MetaLine'
import { StatusIcon } from '../common/StatusLabel'
import IndicatorArea from './IndicatorArea'
import IndicatorCard from './IndicatorCard'
import RateDonut from './RateDonut'
import {
  formatIndicatorValue,
  formatSeoulAvg,
  indicatorGridSpan,
  indicatorReasonText,
} from './indicatorFormat'

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
      <ul className="grid grid-cols-6 gap-4">
        {cards.map((ind, i) => (
          <li key={ind.id} className={`${indicatorGridSpan(i, cards.length)} max-sm:col-span-full`}>
            <ReferenceCard ind={ind} />
          </li>
        ))}
      </ul>
    </IndicatorArea>
  )
}

/** 도넛으로 보여 줄 비율 지표 (반경 안 동종업체 수·주야간 인구비는 숫자 카드 그대로) */
const RATE_IDS: IndicatorId[] = ['closure_rate_12m', 'survival_rate_1y', 'survival_rate_3y']

function ReferenceCard({ ind }: { ind: MetricIndicator }) {
  const value = formatIndicatorValue(ind)
  const emptyText = indicatorReasonText(ind.reason) ?? DATA_STATUS[ind.status].label
  const seoul = formatSeoulAvg(ind)
  const name = INDICATOR_NAME[ind.id as keyof typeof INDICATOR_NAME] ?? ind.id
  const seoulLine = ind.unit === '%' && (seoul || ind.seoul_avg_reason)
  const fraction = value && ind.numerator != null && ind.denominator != null
  const details = (seoulLine || fraction) && (
    <ul className="flex flex-col gap-0.5">
      {seoulLine && (
        <li>
          {seoul ? (
            // 비교 값이 눈에 들어오게 숫자만 진하게
            <>
              {T.seoulAvgLabel}{' '}
              <strong className="font-semibold text-gray-900 tabular-nums">{seoul}</strong>
            </>
          ) : (
            indicatorReasonText(ind.seoul_avg_reason)
          )}
        </li>
      )}
      {fraction && <li>{T.fraction(ind.numerator as number, ind.denominator as number)}</li>}
    </ul>
  )
  const donut = RATE_IDS.includes(ind.id) && ind.unit === '%'
  const statusLabel = DATA_STATUS[ind.status].label
  // 오른쪽 그림 칸 — 비율 지표는 도넛 링(숫자는 왼쪽에만), 동종업체 수는 가게 그림. 같은 크기(136px, 휴대폰 96px)
  const picture = donut ? (
    <RateDonut percent={value && typeof ind.value === 'number' ? ind.value : null} />
  ) : ind.id === 'competitor_count' && IMAGES.storePin ? (
    <img
      src={IMAGES.storePin}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className="size-34 shrink-0 object-contain max-sm:size-24"
    />
  ) : null
  // 카드 본문 좌우 2칸 — 왼쪽 큰 숫자 + 서울 평균·분자/분모, 오른쪽 그림 (세로 가운데)
  const body = (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1.5">
        {value ? (
          <p className="text-title leading-tight font-bold text-gray-900 tabular-nums">{value}</p>
        ) : (
          // 값이 없으면 숫자(0) 대신 상태 글자 + 사유
          <>
            <p className="flex items-center gap-1.5 text-subtitle font-bold text-gray-600">
              <StatusIcon status={ind.status} className="size-5 shrink-0" />
              {statusLabel}
            </p>
            {emptyText !== statusLabel && (
              <p className="text-caption break-keep text-gray-600">{emptyText}</p>
            )}
          </>
        )}
        {details && (
          <div className="text-caption break-keep text-gray-600 lg:text-body">{details}</div>
        )}
      </div>
      {picture}
    </div>
  )
  return (
    <IndicatorCard
      hoverLift
      id={ind.id}
      icon={Calculator}
      iconClassName="text-gray-600"
      title={name}
      // 값이 없으면 숫자(0) 대신 상태 아이콘과 사유만
      value={value}
      empty={{ status: ind.status, text: emptyText }}
      // 그림 칸(136px, 휴대폰 96px) 높이에 맞춰 제목·본문·출처 줄이 카드끼리 가로로 맞는다
      valueClassName="min-h-34 max-sm:min-h-24"
      className="md:p-6"
      visual={body}
      status={ind.status}
      hideFactLabel
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
