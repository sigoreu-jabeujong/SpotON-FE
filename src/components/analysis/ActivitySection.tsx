import { toCommonQueryParams } from '../../api/params'
import { getAsOfRangeMessage, MESSAGES } from '../../constants/messages'
import { getCoordinates, useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { useMarketActivity } from '../../hooks/useMarketActivity'
import { useRisk } from '../../hooks/useRisk'
import type { ActivityInclude } from '../../types/market'
import { formatDataBaseline } from '../../utils/format'
import ErrorState from '../common/ErrorState'
import LoadingState from '../common/LoadingState'
import MetaLine from '../common/MetaLine'
import SubTitle from '../common/SubTitle'
import AnalysisSection from './AnalysisSection'
import ConditionalBlocks from './activity/ConditionalBlocks'
import StoreStatusCards from './activity/StoreStatusCards'
import YearlyTrendChart from './activity/YearlyTrendChart'
import PastViewNote from './nearby/PastViewNote'

const T = MESSAGES.activity
/** 조건부 항목은 항상 요청하고, 자료가 없으면 서버가 null + flags.missing으로 알려 준다 (쿼리 키가 바뀌지 않게 모듈 상수) */
const ACTIVITY_INCLUDE: ActivityInclude[] = ['sales', 'living_pop']

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
          <LoadingState />
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
              <YearlyTrendChart trend={activity.data.data.yearly_trend} />
            </div>

            <ConditionalBlocks activity={activity.data.data} />
          </>
        )}
      </div>
    </AnalysisSection>
  )
}
