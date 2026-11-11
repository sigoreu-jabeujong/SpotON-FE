import { INDICATOR_NAME } from '../../constants/labels'
import { MESSAGES } from '../../constants/messages'
import type { MetricIndicator, RiskIndicator } from '../../types/risk'
import InfoBox from '../common/InfoBox'
import SubTitle from '../common/SubTitle'
import { formatIndicatorValue, formatSeoulAvg } from './indicatorFormat'

const T = MESSAGES.summary

/**
 * 서울 평균 비교 막대 (디자인 "업종별 생존율 비교") — 참고지표 % 값과 서울 평균이 둘 다 있을 때만.
 * 막대 길이는 서버 값을 0~100% 눈금에 그대로 옮긴 것이며, 차이·비율을 계산하지 않는다.
 */
export default function SeoulCompare({ indicators }: { indicators: RiskIndicator[] }) {
  const reference = indicators.filter(
    (i): i is MetricIndicator => i.type === 'reference' && i.unit === '%',
  )
  const rows = reference.filter(
    (i) => typeof i.value === 'number' && typeof i.seoul_avg === 'number',
  )
  const reason = reference.find((i) => i.seoul_avg_reason)?.seoul_avg_reason

  return (
    <div className="flex flex-col gap-3">
      <SubTitle>{T.compareTitle}</SubTitle>
      {rows.length === 0 ? (
        <InfoBox
          showTitle
          title={T.compareHiddenTitle}
          description={reason ?? T.compareHiddenDefault}
        />
      ) : (
        <>
          <p className="text-caption text-gray-600">{T.compareDescription}</p>
          <div className="flex items-center gap-4 text-micro text-gray-600" aria-hidden="true">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-blue-500" />
              {T.compareThis}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-gray-300" />
              {T.compareSeoul}
            </span>
          </div>
          <dl className="flex flex-col gap-4">
            {rows.map((ind) => (
              <div key={ind.id}>
                <dt className="mb-1 text-caption font-semibold text-gray-900">
                  {INDICATOR_NAME[ind.id as keyof typeof INDICATOR_NAME]}
                </dt>
                <dd className="flex flex-col gap-1">
                  <Bar
                    label={T.compareThis}
                    text={formatIndicatorValue(ind) ?? ''}
                    percent={ind.value as number}
                    className="bg-blue-500"
                  />
                  <Bar
                    label={T.compareSeoul}
                    text={formatSeoulAvg(ind) ?? ''}
                    percent={ind.seoul_avg as number}
                    className="bg-gray-300"
                  />
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  )
}

function Bar({
  label,
  text,
  percent,
  className,
}: {
  label: string
  text: string
  percent: number
  className: string
}) {
  const width = `${Math.min(100, Math.max(0, percent))}%`
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-micro text-gray-600">{label}</span>
      <span className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
        <span className={`block h-full rounded-full ${className}`} style={{ width }} />
      </span>
      <span className="w-14 shrink-0 text-right text-caption font-semibold text-gray-900">
        {text}
      </span>
    </div>
  )
}
