import { CirclePlus, CircleX, Clock, Store } from 'lucide-react'
import { SUB_CATEGORY_LABEL } from '../../../constants/labels'
import { MESSAGES } from '../../../constants/messages'
import type { MarketActivity } from '../../../types/market'
import type { MetricIndicator, Risk } from '../../../types/risk'
import { formatCount, formatOperatingMonths, formatPeriod } from '../../../utils/format'
import IndicatorTypeLabel from '../../common/IndicatorTypeLabel'
import MetaLine from '../../common/MetaLine'
import StatCard from '../../common/StatCard'
import StatusLabel from '../../common/StatusLabel'

const T = MESSAGES.activity

type Props = {
  activity: MarketActivity
  /** /risk 결과 (동종업체 수). 로딩·오류면 그 카드만 상태 표시 */
  risk: { data: Risk | undefined; isPending: boolean; isError: boolean }
}

/** 점포 현황 카드 4개 — 모든 값은 서버 값 그대로 */
export default function StoreStatusCards({ activity, risk }: Props) {
  const competitor = risk.data?.indicators.find(
    (i): i is MetricIndicator => i.id === 'competitor_count',
  )
  const period = formatPeriod(activity.recent_12m.period)

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          icon={Store}
          label={T.competitor}
          badge={<IndicatorTypeLabel type="reference" />}
          value={
            risk.isPending
              ? T.loadingValue
              : risk.isError
                ? T.failedValue
                : typeof competitor?.value === 'number' && competitor.status === 'fact'
                  ? formatCount(competitor.value, MESSAGES.units.store)
                  : null
          }
          footer={
            competitor && competitor.status !== 'fact' ? (
              <StatusLabel status={competitor.status} reason={competitor.reason} />
            ) : null
          }
        />
        <StatCard
          icon={CirclePlus}
          label={T.opened12m}
          value={formatCount(activity.recent_12m.opened, MESSAGES.units.store)}
          footer={period && T.periodLabel(period)}
        />
        <StatCard
          icon={CircleX}
          label={T.closed12m}
          value={formatCount(activity.recent_12m.closed, MESSAGES.units.store)}
          footer={period && T.periodLabel(period)}
        />
        <StatCard icon={Clock} label={T.avgPeriod} footer={T.avgPeriodHint}>
          {/* 세부 업종별로 따로 — 합치거나 평균 내지 않는다 */}
          <ul className="mt-0.5 flex flex-col gap-0.5">
            {activity.by_sub_category.map((s) => (
              <li key={s.sub_category} className="flex items-baseline justify-between gap-2">
                <span className="text-caption text-gray-600">
                  {SUB_CATEGORY_LABEL[s.sub_category]}
                </span>
                {s.avg_operating_months === null ? (
                  <StatusLabel status="unknown" />
                ) : (
                  <span className="text-subtitle font-bold text-gray-900">
                    {formatOperatingMonths(s.avg_operating_months)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </StatCard>
      </div>
      {competitor && (
        <MetaLine
          source={competitor.source}
          sourceNames
          period={competitor.period}
          space={competitor.space}
          denominator={competitor.denominator}
          label={T.competitor}
        />
      )}
    </div>
  )
}
