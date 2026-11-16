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
  const { query, search } = useDiagnosisQuery()
  const params = closedHistoryParams(query)
  const history = useLocationHistory(params)
  const h = history.data?.data
  const meta = history.data?.meta
  return (
    <AnalysisSection id="history">
      {!params ? (
        <div className="space-y-2">
          <p>{closedHistoryTitle()}</p>
          <p>{closedHistoryNotice()}</p>
          <Link className="underline" to={{ pathname: ROUTES.input, search }}>
            주소 확인하기
          </Link>
        </div>
      ) : history.isPending ? (
        <LoadingSkeleton variant="table" />
      ) : history.isError ? (
        <ErrorState error={history.error} onRetry={() => void history.refetch()} />
      ) : (
        h && (
          <div className="flex flex-col gap-4">
            {h.total === 0 && (
              <div role="status">
                <p>
                  {h.location?.result_status === 'pending_identity'
                    ? '주소를 확인한 뒤 다시 조회해 주세요.'
                    : '조건에 맞는 점포 이력이 조회되지 않았어요.'}
                </p>
                {h.location?.location_coverage === 'partial' && <p>{closedHistoryNotice(h)}</p>}
              </div>
            )}
            {h.total > 0 && <HistoryTable stores={h.stores} />}
            <MetaLine
              source={meta?.source}
              sourceNames
              baseline={formatDataBaseline(meta)}
              spaceLabel="선택한 주소·상세 위치의 점포 이력"
              denominator={meta?.denominator}
              isDemo={meta?.is_demo}
            />
          </div>
        )
      )}
    </AnalysisSection>
  )
}
