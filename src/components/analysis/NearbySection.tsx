import { useRef, useState } from 'react'
import { toCommonQueryParams } from '../../api/params'
import { getAsOfRangeMessage, MESSAGES } from '../../constants/messages'
import { getCoordinates, useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { useNearbyStores } from '../../hooks/useStores'
import { formatDataBaseline, formatDate, formatYearMonthKo } from '../../utils/format'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import LoadingState from '../common/LoadingState'
import MetaLine from '../common/MetaLine'
import SubTitle from '../common/SubTitle'
import MapLegend from '../map/MapLegend'
import NearbyMap from '../map/NearbyMap'
import AnalysisSection from './AnalysisSection'
import ConditionFilterBar from './ConditionFilterBar'
import NearbyTable from './nearby/NearbyTable'
import PastViewBanner from './nearby/PastViewBanner'
import SnapshotBlock from './nearby/SnapshotBlock'

const T = MESSAGES.nearby

/** STEP 02 ② 주변 점포 분석 — F-03 지도 · F-04 필터 (/stores/nearby) · F-05 시점 조회 (/stores/snapshot) */
export default function NearbySection() {
  const { query } = useDiagnosisQuery()
  const coords = getCoordinates(query)
  const params = coords ? toCommonQueryParams(query, coords) : null
  const nearby = useNearbyStores(params)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const mapWrapRef = useRef<HTMLDivElement>(null)

  /** 표에서 고르면 지도가 보이게 올려 주고 마커를 강조한다 */
  const selectFromTable = (id: string) => {
    setSelectedId(id)
    mapWrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const pastLabel = formatYearMonthKo(query.asOf)
  const data = nearby.data?.data
  const meta = nearby.data?.meta

  return (
    <AnalysisSection id="nearby">
      <div className="flex flex-col gap-6">
        <PastViewBanner />
        <ConditionFilterBar />

        <div className="flex flex-col gap-3">
          <SubTitle>{T.mapTitle}</SubTitle>
          {nearby.isPending ? (
            <LoadingState />
          ) : nearby.isError ? (
            <ErrorState
              error={nearby.error}
              message={getAsOfRangeMessage(nearby.error) ?? undefined}
              onRetry={() => void nearby.refetch()}
            />
          ) : (
            data && (
              <>
                <div ref={mapWrapRef} className="scroll-mt-8">
                  <NearbyMap
                    center={data.center}
                    radiusM={data.radius_m}
                    markers={data.markers}
                    badge={T.mapBadge(data.radius_m, formatDate(data.as_of))}
                    pastBadge={pastLabel ? T.pastBadge(pastLabel) : null}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                </div>
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

                <div className="mt-6 flex flex-col gap-3">
                  <SubTitle>{T.tableTitle}</SubTitle>
                  {data.count === 0 || data.markers.length === 0 ? (
                    <EmptyState message={data.message ?? MESSAGES.common.empty} />
                  ) : (
                    <NearbyTable
                      markers={data.markers}
                      selectedId={selectedId}
                      onSelect={selectFromTable}
                    />
                  )}
                </div>
              </>
            )
          )}
        </div>

        {/* 시점 조회 (F-05) — 지도·표가 실패해도 따로 보인다 */}
        <div className="mt-4">
          <SnapshotBlock />
        </div>
      </div>
    </AnalysisSection>
  )
}
