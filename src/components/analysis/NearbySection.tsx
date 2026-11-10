import { useState } from 'react'
import { toCommonQueryParams } from '../../api/params'
import { MESSAGES } from '../../constants/messages'
import { getCoordinates, useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { useNearbyStores } from '../../hooks/useStores'
import { formatDataBaseline, formatDate } from '../../utils/format'
import ErrorState from '../common/ErrorState'
import LoadingState from '../common/LoadingState'
import MetaLine from '../common/MetaLine'
import SubTitle from '../common/SubTitle'
import MapLegend from '../map/MapLegend'
import NearbyMap from '../map/NearbyMap'
import AnalysisSection from './AnalysisSection'
import ConditionFilterBar from './ConditionFilterBar'

const T = MESSAGES.nearby

/** STEP 02 ② 주변 점포 분석 (F-03 지도 · F-04 필터) — /stores/nearby. 시점 조회(F-05)는 다음 작업 */
export default function NearbySection() {
  const { query } = useDiagnosisQuery()
  const coords = getCoordinates(query)
  const params = coords ? toCommonQueryParams(query, coords) : null
  const nearby = useNearbyStores(params)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const data = nearby.data?.data
  const meta = nearby.data?.meta

  return (
    <AnalysisSection id="nearby">
      <div className="flex flex-col gap-6">
        <ConditionFilterBar />

        <div className="flex flex-col gap-3">
          <SubTitle>{T.mapTitle}</SubTitle>
          {nearby.isPending ? (
            <LoadingState />
          ) : nearby.isError ? (
            <ErrorState error={nearby.error} onRetry={() => void nearby.refetch()} />
          ) : (
            data && (
              <>
                <NearbyMap
                  center={data.center}
                  radiusM={data.radius_m}
                  markers={data.markers}
                  badge={T.mapBadge(data.radius_m, formatDate(data.as_of))}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <MapLegend />
                  {/* 전체 수는 서버 count 그대로 */}
                  <p className="text-caption font-semibold text-gray-900">{T.total(data.count)}</p>
                </div>
                {data.excluded_no_coord > 0 && (
                  <p className="text-caption text-gray-600">
                    {T.excludedNoCoord(data.excluded_no_coord)}
                  </p>
                )}
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
          )}
        </div>
      </div>
    </AnalysisSection>
  )
}
