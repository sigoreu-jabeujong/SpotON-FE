import { CirclePlus, CircleX, Clock, Store } from 'lucide-react'
import { SUB_CATEGORY_LABEL } from '../../../constants/labels'
import { MESSAGES } from '../../../constants/messages'
import type { MarketActivity } from '../../../types/market'
import type { MetricIndicator, Risk } from '../../../types/risk'
import { formatCount, formatOperatingMonths, formatPeriod } from '../../../utils/format'
import InfoPopover from '../../common/InfoPopover'
import MetaLine from '../../common/MetaLine'
import StatCard from '../../common/StatCard'
import StatusLabel from '../../common/StatusLabel'
import SubCategoryNote from '../../common/SubCategoryNote'
import { indicatorReasonText } from '../../summary/indicatorFormat'

const T = MESSAGES.activity

type Props = {
  activity: MarketActivity
  /** /risk 결과 (동종업체 수). 로딩·오류면 그 카드만 상태 표시 */
  risk: { data: Risk | undefined; isPending: boolean; isError: boolean }
}

/** 점포 현황 카드 4개 — 모든 값은 서버 값 그대로 */
export default function StoreStatusCards({ activity, risk }: Props) {
  const competitor = risk.data?.indicators?.find(
    (i): i is MetricIndicator => i.id === 'competitor_count',
  )
  const period = formatPeriod(activity.recent_12m.period)

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-3 max-md:grid-cols-2 max-sm:grid-cols-1">
        <StatCard
          icon={Store}
          label={T.competitor}
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
              <StatusLabel
                status={competitor.status}
                reason={indicatorReasonText(competitor.reason)}
              />
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
        <StatCard
          icon={Clock}
          label={T.avgPeriod}
          // 정의(기준 시점까지 경과 기간 평균, 폐업 점포 수명 아님)는 제목 옆 ⓘ로
          badge={
            <InfoPopover
              triggerLabel={T.avgPeriodInfo.trigger}
              title={T.avgPeriodInfo.title}
              closeLabel={T.avgPeriodInfo.close}
            >
              <span className="block">{T.avgPeriodInfo.body}</span>
            </InfoPopover>
          }
        >
          <AvgPeriod items={activity.by_sub_category ?? []} />
        </StatCard>
      </div>
      {/* 세부 업종별 평균 기간 카드 바로 아래 — 음식점일 때만 */}
      <SubCategoryNote />
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

/**
 * 평균 영업 기간 — 업종이 하나면 큰 숫자 하나만. 음식점 세부 업종을 여러 개 고르면 서버가 합친 값을 주지 않으므로
 * 지금처럼 업종별로 따로 보여 준다 (FE에서 합치거나 평균 내지 않음)
 */
function AvgPeriod({ items }: { items: MarketActivity['by_sub_category'] }) {
  if (items.length === 1) {
    const months = items[0].avg_operating_months
    return months === null ? (
      <div className="mt-1">
        <StatusLabel status="unknown" />
      </div>
    ) : (
      <p className="text-title leading-tight font-bold text-gray-900 tabular-nums">
        {formatOperatingMonths(months)}
      </p>
    )
  }
  if (items.length === 0)
    return <p className="text-title leading-tight font-bold text-gray-900">—</p>
  return (
    <ul className="mt-0.5 flex flex-col gap-0.5">
      {items.map((s) => (
        <li key={s.sub_category} className="flex items-baseline justify-between gap-2">
          <span className="text-caption text-gray-600">{SUB_CATEGORY_LABEL[s.sub_category]}</span>
          {s.avg_operating_months === null ? (
            <StatusLabel status="unknown" />
          ) : (
            <span className="text-subtitle font-bold text-gray-900 tabular-nums">
              {formatOperatingMonths(s.avg_operating_months)}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
