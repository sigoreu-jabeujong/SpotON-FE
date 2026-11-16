import type { PopulationParams } from '../../../types/population'
import { useLocationReference } from '../../../hooks/useLocationReference'
import ErrorState from '../../common/ErrorState'
import SectionErrorBoundary from '../../common/SectionErrorBoundary'
import LocationReferenceView from './LocationReferenceView'
import PopulationReferenceSection from './PopulationReferenceSection'

export default function LocationReferenceSection({ params }: { params: PopulationParams | null }) {
  const reference = useLocationReference(params)
  if (!params) return null
  return (
    <div id="location-reference" className="min-w-0">
      {reference.isPending || reference.isFetching ? (
        <p role="status">위치에 연결된 매출·생활인구 자료를 불러오고 있어요.</p>
      ) : reference.isError ? (
        <ErrorState error={reference.error} onRetry={() => void reference.refetch()} />
      ) : (
        <SectionErrorBoundary resetKey={String(reference.dataUpdatedAt)}>
          <LocationReferenceView
            data={reference.data.data}
            isDemo={reference.data.meta?.is_demo ?? false}
            // 250m 격자 공개자료는 생활인구 카드 안 접힌 표로 (따로 된 카드 없이)
            grid={<PopulationReferenceSection params={params} />}
          />
        </SectionErrorBoundary>
      )}
    </div>
  )
}
