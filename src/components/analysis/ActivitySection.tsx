import { lazy, Suspense } from 'react'
import { ACTIVITY_INCLUDE, toCommonQueryParams } from '../../api/params'
import { getAsOfRangeMessage, MESSAGES } from '../../constants/messages'
import { getCoordinates, useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { useMarketActivity } from '../../hooks/useMarketActivity'
import { useRisk } from '../../hooks/useRisk'
import { formatDataBaseline } from '../../utils/format'
import ErrorState from '../common/ErrorState'
import LoadingSkeleton from '../common/Skeleton'
import MetaLine from '../common/MetaLine'
import SubTitle from '../common/SubTitle'
import AnalysisSection from './AnalysisSection'
import ConditionalBlocks from './activity/ConditionalBlocks'
import StoreStatusCards from './activity/StoreStatusCards'
import PastViewNote from './nearby/PastViewNote'

const T = MESSAGES.activity
/** 차트 라이브러리(recharts)는 이 섹션이 그려질 때만 따로 불러온다 */
const YearlyTrendChart = lazy(() => import('./activity/YearlyTrendChart'))

/** STEP 02 ③ 상권 활동 분석 (F-06) — /market/activity + /risk의 competitor_count */
export default function ActivitySection() {
  const { query } = useDiagnosisQuery()
  const coords = getCoordinates(query)
  const params = coords ? toCommonQueryParams(query, coords) : null
  const activity = useMarketActivity(params, ACTIVITY_INCLUDE)
  // 종합 진단 화면과 같은 쿼리 키(include 없음) → 캐시 공유
  const risk = useRisk(params)
  const meta = activity.data?.meta

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
            message={getAsOfRangeMessage(activity.error) ?? undefined}
            onRetry={
              getAsOfRangeMessage(activity.error) ? undefined : () => void activity.refetch()
            }
          />
        ) : (
          <>
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
            </div>

            <ConditionalBlocks activity={activity.data.data} />
          </>
        )}
      </div>
    </AnalysisSection>
  )
}
