import type { PopulationParams } from '../../../types/population'
import { usePopulationReference } from '../../../hooks/usePopulationReference'
import { MESSAGES } from '../../../constants/messages'
import ErrorState from '../../common/ErrorState'
import SectionErrorBoundary from '../../common/SectionErrorBoundary'
import PopulationReferenceView from './PopulationReferenceView'

export default function PopulationReferenceSection({
  params,
}: {
  params: PopulationParams | null
}) {
  const population = usePopulationReference(params)
  if (!params) return null
  return (
    <div id="population-reference" className="min-w-0">
      {population.isPending || population.isFetching ? (
        <p role="status" className="text-caption text-gray-600">
          {MESSAGES.reference.grid.loading}
        </p>
      ) : population.isError ? (
        <ErrorState error={population.error} onRetry={() => void population.refetch()} />
      ) : (
        <SectionErrorBoundary resetKey={String(population.dataUpdatedAt)}>
          <PopulationReferenceView
            data={population.data.data}
            isDemo={population.data.meta?.is_demo ?? false}
          />
        </SectionErrorBoundary>
      )}
    </div>
  )
}
