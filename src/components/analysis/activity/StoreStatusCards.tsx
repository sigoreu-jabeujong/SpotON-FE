import { CirclePlus, CircleX, Clock, Store } from 'lucide-react'
import { MESSAGES } from '../../../constants/messages'
import type { MarketActivity } from '../../../types/market'
import type { MetricIndicator, Risk } from '../../../types/risk'
import { formatCount, formatOperatingMonths } from '../../../utils/format'
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
        />
        <StatCard
          icon={CircleX}
          label={T.closed12m}
          value={formatCount(activity.recent_12m.closed, MESSAGES.units.store)}
        />
        <StatCard
          icon={Clock}
          label={T.avgPeriod}
          value={formatOperatingMonths(activity.avg_operating_months)}
          // 정의(기준 시점까지 경과 기간 평균, 폐업 점포 수명 아님)는 제목 옆 ⓘ로
          badge={
            <InfoPopover
              triggerLabel={T.avgPeriodInfo.trigger}
              title={T.avgPeriodInfo.title}
              closeLabel={T.avgPeriodInfo.close}
              // 화면 오른쪽 끝 카드라 팝오버를 왼쪽으로 펼친다
              align="end"
            >
              <span className="block">{T.avgPeriodInfo.body}</span>
            </InfoPopover>
          }
        />
      </div>
      {/* 세부 업종 기준 안내 — 음식점일 때만 */}
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
