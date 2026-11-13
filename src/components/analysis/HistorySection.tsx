import { CalendarDays, Info, ScrollText } from 'lucide-react'
import { toStoreHistoryParams } from '../../api/params'
import { MESSAGES } from '../../constants/messages'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { useStoreHistory } from '../../hooks/useStores'
import { formatCount, formatDataBaseline, formatDate } from '../../utils/format'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import KnowMore from '../common/KnowMore'
import LoadingSkeleton from '../common/Skeleton'
import SectionCard from '../common/SectionCard'
import SourceLine from '../common/SourceLine'
import SummaryStats from '../common/SummaryStats'
import AnalysisSection from './AnalysisSection'
import HistoryTable from './history/HistoryTable'

const T = MESSAGES.history

/** STEP 02 탭 ① 과거 점포 이력 (F-02) — /stores/history. 요약 → 표(더보기) → 출처 한 줄 → 알아두세요 */
export default function HistorySection() {
  const { query } = useDiagnosisQuery()
  const history = useStoreHistory(toStoreHistoryParams(query))
  const meta = history.data?.meta

  return (
    <AnalysisSection id="history">
      {history.isPending ? (
        <LoadingSkeleton variant="table" />
      ) : history.isError ? (
        <ErrorState error={history.error} onRetry={() => void history.refetch()} />
      ) : (
        <>
          {/* 서버 total·기준일 그대로 (계산하지 않음) */}
          <SummaryStats
            label={MESSAGES.frame.summaryLabel(T.tabTitle)}
            items={[
              {
                key: 'total',
                label: T.statTotal,
                value: formatCount(history.data.data.total, MESSAGES.units.record),
                icon: ScrollText,
              },
              {
                key: 'baseline',
                label: T.statBaseline,
                value: formatDate(meta?.data_updated_at),
                icon: CalendarDays,
              },
            ]}
          />
          <SectionCard title={T.tableTitle}>
            {!query.floorUnit && (
              <p className="flex items-center gap-1.5 text-caption text-gray-600">
                <Info className="size-4 shrink-0" aria-hidden="true" />
                {T.noFloor}
              </p>
            )}
            {history.data.data.total === 0 || !history.data.data.stores?.length ? (
              <EmptyState message={history.data.data.message ?? MESSAGES.common.empty} />
            ) : (
              <HistoryTable stores={history.data.data.stores} />
            )}
            <SourceLine
              source={meta?.source}
              baseline={formatDataBaseline(meta)}
              spaceLabel={T.spaceBuilding}
              denominator={meta?.denominator}
              isDemo={meta?.is_demo}
            />
          </SectionCard>
          <KnowMore items={T.notices} title={`${MESSAGES.frame.knowMore} · ${T.noticeTitle}`} />
        </>
      )}
    </AnalysisSection>
  )
}
