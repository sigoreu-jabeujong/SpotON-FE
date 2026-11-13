import { lazy, Suspense } from 'react'
import { useAsOfRangeMessage } from '../../hooks/useAsOfRangeMessage'
import { ACTIVITY_INCLUDE, toCommonQueryParams } from '../../api/params'
import { MESSAGES } from '../../constants/messages'
import { getCoordinates, useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { useMarketActivity } from '../../hooks/useMarketActivity'
import { useRisk } from '../../hooks/useRisk'
import type { ApiMeta } from '../../types/api'
import { formatDataBaseline } from '../../utils/format'
import ErrorState from '../common/ErrorState'
import FranchiseFilterNotice from '../common/FranchiseFilterNotice'
import LoadingSkeleton from '../common/Skeleton'
import MetaLine from '../common/MetaLine'
import SubTitle from '../common/SubTitle'
import AnalysisSection from './AnalysisSection'
import ConditionalBlocks from './activity/ConditionalBlocks'
import StoreStatusCards from './activity/StoreStatusCards'
import PastViewNote from './nearby/PastViewNote'
import { focusConditionFilter } from '../../utils/focusConditionFilter'

const T = MESSAGES.activity
/** 차트 라이브러리(recharts)는 이 섹션이 그려질 때만 따로 불러온다 */
const YearlyTrendChart = lazy(() => import('./activity/YearlyTrendChart'))

/** STEP 02 ③ 상권 활동 분석 (F-06) — /market/activity + /risk의 competitor_count */
export default function ActivitySection() {
  const { query } = useDiagnosisQuery()
  const asOfRangeMessage = useAsOfRangeMessage()
  const coords = getCoordinates(query)
  const params = coords ? toCommonQueryParams(query, coords) : null
  const activity = useMarketActivity(params, ACTIVITY_INCLUDE)
  // 종합 진단 화면과 같은 쿼리 키(include 없음) → 캐시 공유
  const risk = useRisk(params)
  const meta = activity.data?.meta
  const ytd = ytdMonthDay(meta)

  return (
    <AnalysisSection id="activity">
      <div className="flex flex-col gap-6">
        <PastViewNote asOf={query.asOf} />
        {activity.isPending ? (
          <div className="flex flex-col gap-6">
            <LoadingSkeleton variant="cards" />
            <LoadingSkeleton variant="chart" />
          </div>
        ) : activity.isError ? (
          <ErrorState
            error={activity.error}
            message={asOfRangeMessage(activity.error) ?? undefined}
            onRetry={asOfRangeMessage(activity.error) ? undefined : () => void activity.refetch()}
            onEditConditions={asOfRangeMessage(activity.error) ? focusConditionFilter : undefined}
          />
        ) : (
          <>
            {/* 가맹 필터를 고르면 기준 안내 — 0건이어도 "점포 없음"으로 단정하지 않게 */}
            <FranchiseFilterNotice franchise={query.franchise} meta={meta} />
            <div className="flex flex-col gap-3">
              <SubTitle>{T.statusTitle}</SubTitle>
              <StoreStatusCards
                activity={activity.data.data}
                risk={{ data: risk.data?.data, isPending: risk.isPending, isError: risk.isError }}
              />
              <MetaLine
                label={T.statusTitle}
                source={meta?.source}
                sourceNames
                asOf={meta?.as_of}
                baseline={formatDataBaseline(meta)}
                space={meta?.space}
                denominator={meta?.denominator}
                isDemo={meta?.is_demo}
              />
            </div>

            <div className="flex flex-col gap-3">
              <SubTitle>{T.trendTitle}</SubTitle>
              <Suspense fallback={<LoadingSkeleton variant="chart" />}>
                <YearlyTrendChart trend={activity.data.data.yearly_trend} />
              </Suspense>
              {ytd && <p className="text-caption text-gray-600">{T.trendYtd(ytd)}</p>}
            </div>

            <ConditionalBlocks activity={activity.data.data} meta={meta} />
          </>
        )}
      </div>
    </AnalysisSection>
  )
}

/**
 * 연도별 비교가 "같은 월일까지(YTD)"이면 그 월일 ("10월 31일") — 가장 최근 연도 비교 기간의 끝 날짜.
 * 서버 기간을 그대로 읽기만 한다 (날짜를 계산하지 않음). 기준이 없거나 다르면 null
 */
function ytdMonthDay(meta: ApiMeta | null | undefined): string | null {
  if (meta?.yearly_comparison_basis !== 'same_month_day_ytd' || !meta.yearly_periods) return null
  const latest = Object.keys(meta.yearly_periods).sort().at(-1)
  const end = latest ? meta.yearly_periods[latest]?.end : null
  const m = end ? /^\d{4}-(\d{2})-(\d{2})$/.exec(end) : null
  return m ? `${Number(m[1])}월 ${Number(m[2])}일` : null
}
