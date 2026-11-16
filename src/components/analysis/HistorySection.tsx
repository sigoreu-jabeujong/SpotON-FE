import { Link } from 'react-router'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { useLocationHistory } from '../../hooks/useStores'
import {
  closedHistoryParams,
  closedHistoryTitle,
  closedHistoryNotice,
} from '../../utils/closedHistory'
import { formatDataBaseline } from '../../utils/format'
import { ROUTES } from '../../constants/routes'
import ErrorState from '../common/ErrorState'
import LoadingSkeleton from '../common/Skeleton'
import MetaLine from '../common/MetaLine'
import AnalysisSection from './AnalysisSection'
import HistoryTable from './history/HistoryTable'

export default function HistorySection() {
  const { query, search, updateQuery } = useDiagnosisQuery()
  const params = closedHistoryParams(query)
  const history = useLocationHistory(params)
  const h = history.data?.data
  const meta = history.data?.meta
  return (
    <AnalysisSection id="history">
      <div className="mb-4 flex flex-wrap gap-4 text-caption">
        <label className="flex w-full max-w-full min-w-0 flex-col gap-2 sm:w-auto">
          이력 비교 범위{' '}
          <select
            aria-label="이력 비교 범위"
            value={query.historyScope ?? (query.floorUnit?.includes('호') ? 'unit' : 'floor')}
            onChange={(e) => updateQuery({ historyScope: e.target.value as 'floor' | 'unit' })}
            className="w-full max-w-full min-w-0 rounded border p-2"
          >
            <option value="floor">같은 층</option>
            <option value="unit" disabled={!query.floorUnit?.includes('호')}>
              같은 층·호수
            </option>
          </select>
        </label>
        <label className="flex w-full max-w-full min-w-0 flex-col gap-2 sm:w-auto">
          주소 확인 기준{' '}
          <select
            aria-label="주소 확인 기준"
            value={query.historyIdentity ?? 'address_scope'}
            onChange={(e) =>
              updateQuery({
                historyIdentity: e.target.value as 'address_scope' | 'verified_building',
              })
            }
            className="w-full max-w-full min-w-0 rounded border p-2"
          >
            <option value="address_scope">같은 지번 주소 범위 (참고)</option>
            <option value="verified_building">검증된 같은 건물·동</option>
          </select>
        </label>
      </div>
      {!params ? (
        <div className="space-y-2">
          <p>{closedHistoryTitle()}</p>
          <p>{closedHistoryNotice()}</p>
          <Link className="underline" to={{ pathname: ROUTES.input, search }}>
            층·호수 입력하기
          </Link>
        </div>
      ) : history.isPending ? (
        <LoadingSkeleton variant="table" />
      ) : history.isError ? (
        <ErrorState error={history.error} onRetry={() => void history.refetch()} />
      ) : (
        h && (
          <div className="flex flex-col gap-4">
            <p className="text-subtitle font-bold" role="status">
              {closedHistoryTitle(h)}
            </p>
            <p className="text-caption text-gray-600">{closedHistoryNotice(h)}</p>
            {h.total > 0 && <HistoryTable stores={h.stores} />}
            <MetaLine
              source={meta?.source}
              sourceNames
              baseline={formatDataBaseline(meta)}
              spaceLabel="선택한 주소·상세 위치의 폐업 이력"
              denominator={meta?.denominator}
              isDemo={meta?.is_demo}
            />
          </div>
        )
      )}
    </AnalysisSection>
  )
}
