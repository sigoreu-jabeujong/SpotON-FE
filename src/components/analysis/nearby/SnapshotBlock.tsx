import { CircleCheck, CircleHelp, CircleX, History, Info, Store } from 'lucide-react'
import { toCommonQueryParams } from '../../../api/params'
import { getAsOfRangeMessage, MESSAGES } from '../../../constants/messages'
import { useDataRange } from '../../../hooks/useDataRange'
import { getCoordinates, useDiagnosisQuery } from '../../../hooks/useDiagnosisQuery'
import { useStoreSnapshot } from '../../../hooks/useStores'
import { isMonthInRange, shiftMonth } from '../../../utils/date'
import { formatCount, formatDataBaseline, formatYearMonthKo } from '../../../utils/format'
import EmptyState from '../../common/EmptyState'
import ErrorState from '../../common/ErrorState'
import LoadingState from '../../common/LoadingState'
import MetaLine from '../../common/MetaLine'
import StatCard from '../../common/StatCard'
import SubTitle from '../../common/SubTitle'
import SnapshotTable from './SnapshotTable'

const T = MESSAGES.snapshot

/**
 * 시점 조회 (F-05) — 과거 기준 시점에 영업하던 점포가 지금 어떻게 됐는지.
 * 숫자는 서버 값 그대로 표시한다 (더하거나 비율을 계산하지 않음).
 */
export default function SnapshotBlock() {
  const { query, updateQuery } = useDiagnosisQuery()
  const coords = getCoordinates(query)
  const params = coords ? toCommonQueryParams(query, coords) : null
  const snapshot = useStoreSnapshot(params)
  const periodLabel = formatYearMonthKo(query.asOf)

  return (
    <div className="flex flex-col gap-4">
      <SubTitle>{T.title}</SubTitle>
      {!query.asOf ? (
        <SnapshotGuide category={query.category} onPick={(asOf) => updateQuery({ asOf })} />
      ) : snapshot.isPending ? (
        <LoadingState />
      ) : snapshot.isError ? (
        getAsOfRangeMessage(snapshot.error) ? (
          // 범위 밖 시점은 다시 시도해도 같으므로 기간 안내만
          <ErrorState message={getAsOfRangeMessage(snapshot.error) ?? undefined} />
        ) : (
          <ErrorState error={snapshot.error} onRetry={() => void snapshot.refetch()} />
        )
      ) : (
        <SnapshotResult data={snapshot.data} periodLabel={periodLabel ?? ''} />
      )}
    </div>
  )
}

function SnapshotResult({
  data: { data, meta },
  periodLabel,
}: {
  data: NonNullable<ReturnType<typeof useStoreSnapshot>['data']>
  periodLabel: string
}) {
  const count = (n: number) => formatCount(n, MESSAGES.units.store)
  return (
    <>
      {/* 서버 summary_text 그대로 */}
      <p className="rounded-control bg-blue-100 px-5 py-4 text-subtitle font-bold text-blue-700">
        {data.summary_text}
      </p>
      <div className="grid grid-cols-4 gap-3">
        <StatCard icon={Store} label={T.cards.total} value={count(data.total_at_as_of)} />
        <StatCard icon={CircleCheck} label={T.cards.stillOpen} value={count(data.still_open)} />
        <StatCard icon={CircleX} label={T.cards.closedSince} value={count(data.closed_since)} />
        <StatCard icon={CircleHelp} label={T.cards.other} value={count(data.other)} />
      </div>
      {data.stores.length === 0 ? (
        <EmptyState message={T.emptyStores} />
      ) : (
        <SnapshotTable stores={data.stores} periodLabel={periodLabel} />
      )}
      <p className="flex items-center gap-1.5 text-caption text-gray-600">
        <Info className="size-4 shrink-0" aria-hidden="true" />
        {T.notice}
      </p>
      <MetaLine
        source={meta?.source}
        sourceNames
        asOf={meta?.as_of}
        baseline={formatDataBaseline(meta)}
        space={meta?.space}
        denominator={meta?.denominator}
        isDemo={meta?.is_demo}
      />
    </>
  )
}

/** 기준 시점이 없을 때: 안내 + 빠른 선택 (누르면 바로 조회) */
function SnapshotGuide({
  category,
  onPick,
}: {
  category: ReturnType<typeof useDiagnosisQuery>['query']['category']
  onPick: (asOf: string) => void
}) {
  const range = useDataRange(category ? { category } : null).data?.data ?? null
  return (
    <div className="flex flex-col items-center gap-3 rounded-control border border-dashed border-gray-300 bg-gray-100 px-6 py-8 text-center">
      <History className="size-7 text-blue-500" aria-hidden="true" />
      <p className="text-body text-gray-900">{T.guide}</p>
      <div className="flex flex-wrap items-center justify-center gap-2" aria-label={T.quickTitle}>
        {MESSAGES.filter.asOfQuick.map((q) => {
          const target = range ? shiftMonth(range.max_month, -q.months) : null
          const ok = !!range && !!target && isMonthInRange(target, range.min_month, range.max_month)
          return (
            <button
              key={q.label}
              type="button"
              disabled={!ok}
              onClick={() => target && onPick(target)}
              className="rounded-full border border-blue-500 bg-gray-0 px-4 py-1.5 text-caption font-semibold text-blue-700 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-300"
            >
              {q.label}
              {target && ok && (
                <span className="ml-1 font-normal text-gray-600">
                  ({formatYearMonthKo(target)})
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
