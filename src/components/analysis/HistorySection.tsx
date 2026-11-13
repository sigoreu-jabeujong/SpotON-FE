import { Info, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router'
import { toStoreHistoryParams } from '../../api/params'
import { MESSAGES } from '../../constants/messages'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { useStoreHistory } from '../../hooks/useStores'
import { formatDataBaseline } from '../../utils/format'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import LoadingSkeleton from '../common/Skeleton'
import InfoBox from '../common/InfoBox'
import MetaLine from '../common/MetaLine'
import AnalysisSection from './AnalysisSection'
import HistoryTable from './history/HistoryTable'
import { ROUTES } from '../../constants/routes'

const T = MESSAGES.history

/** STEP 02 ① 과거 점포 이력 (F-02) — /stores/history */
export default function HistorySection() {
  const { query, search } = useDiagnosisQuery()
  const history = useStoreHistory(toStoreHistoryParams(query))
  const meta = history.data?.meta

  return (
    <AnalysisSection id="history">
      {history.isPending ? (
        <LoadingSkeleton variant="table" />
      ) : history.isError ? (
        <ErrorState error={history.error} onRetry={() => void history.refetch()} />
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            {/* 서버 total 그대로 표시 (계산하지 않음) */}
            <p className="text-subtitle font-bold text-gray-900">
              {T.summary(history.data.data.total)}
            </p>
            {!query.floorUnit && (
              <p className="mt-1 flex items-center gap-1.5 text-caption text-gray-600">
                <Info className="size-4 shrink-0" aria-hidden="true" />
                {T.noFloor}
              </p>
            )}
          </div>
          {history.data.data.total === 0 || !history.data.data.stores?.length ? (
            <EmptyState
              message={history.data.data.message ?? MESSAGES.common.empty}
              description={T.emptyHint}
              action={
                // 주소·층은 입력 화면에서 바꾼다 (지금 주소·업종이 채워진 채로 열림)
                <Link
                  to={{ pathname: ROUTES.input, search }}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-gray-0 px-4 text-body font-semibold text-blue-700 ring-1 ring-blue-500/40 ring-inset hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  {MESSAGES.common.editConditions}
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                </Link>
              }
            />
          ) : (
            <HistoryTable stores={history.data.data.stores} />
          )}
          <InfoBox title={T.noticeTitle} items={T.notices} />
          <MetaLine
            source={meta?.source}
            sourceNames
            baseline={formatDataBaseline(meta)}
            spaceLabel={T.spaceBuilding}
            denominator={meta?.denominator}
            isDemo={meta?.is_demo}
          />
        </div>
      )}
    </AnalysisSection>
  )
}
