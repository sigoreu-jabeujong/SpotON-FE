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
import SectionCard from '../common/SectionCard'
import SourceLine from '../common/SourceLine'
import AnalysisSection from './AnalysisSection'
import ConditionalBlocks from './activity/ConditionalBlocks'
import StoreStatusCards from './activity/StoreStatusCards'
import PastViewNote from './nearby/PastViewNote'

const T = MESSAGES.activity
/** 차트 라이브러리(recharts)는 이 섹션이 그려질 때만 따로 불러온다 */
const YearlyTrendChart = lazy(() => import('./activity/YearlyTrendChart'))

/**
 * STEP 02 탭 ③ 상권 활동 (F-06) — /market/activity + /risk의 competitor_count.
 * 요약(점포 현황 카드) → 연도별 차트 → 조건부 지표 → 출처 한 줄
 */
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
      <PastViewNote asOf={query.asOf} />
      {activity.isPending ? (
        <div className="flex flex-col gap-stack-3">
          <LoadingSkeleton variant="cards" />
          <LoadingSkeleton variant="chart" />
        </div>
      ) : activity.isError ? (
        <ErrorState
          error={activity.error}
          message={asOfRangeMessage(activity.error) ?? undefined}
          onRetry={asOfRangeMessage(activity.error) ? undefined : () => void activity.refetch()}
        />
      ) : (
        <>
          {/* 가맹 필터를 고르면 기준 안내 — 0건이어도 "점포 없음"으로 단정하지 않게 */}
          <FranchiseFilterNotice franchise={query.franchise} meta={meta} />
          {/* 요약 — 점포 현황 카드 4개 (서버 값 그대로) */}
          <StoreStatusCards
            activity={activity.data.data}
            risk={{ data: risk.data?.data, isPending: risk.isPending, isError: risk.isError }}
          />

          <SectionCard title={T.trendTitle}>
            <Suspense fallback={<LoadingSkeleton variant="chart" />}>
              <YearlyTrendChart trend={activity.data.data.yearly_trend} />
            </Suspense>
            {ytd && <p className="text-caption text-gray-600">{T.trendYtd(ytd)}</p>}
          </SectionCard>

          <SectionCard>
            <ConditionalBlocks activity={activity.data.data} meta={meta} />
          </SectionCard>

          {/* 점포 현황·연도별 추이의 출처 (조건부 지표는 블록마다 따로) */}
          <SourceLine
            label={T.sourceLabel}
            source={meta?.source}
            asOf={meta?.as_of}
            baseline={formatDataBaseline(meta)}
            space={meta?.space}
            denominator={meta?.denominator}
            isDemo={meta?.is_demo}
          />
        </>
      )}
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
