import { CalendarDays, CircleDot, Store } from 'lucide-react'
import { useRef, useState } from 'react'
import { useAsOfRangeMessage } from '../../hooks/useAsOfRangeMessage'
import { toCommonQueryParams } from '../../api/params'
import { MESSAGES } from '../../constants/messages'
import { scrollBehavior } from '../../constants/motion'
import { getCoordinates, useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { useNearbyStores } from '../../hooks/useStores'
import { franchiseEmptyMessage } from '../../utils/storeDisplay'
import { formatCount, formatDataBaseline, formatDate, formatYearMonthKo } from '../../utils/format'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import LoadingSkeleton from '../common/Skeleton'
import SectionCard from '../common/SectionCard'
import SectionErrorBoundary from '../common/SectionErrorBoundary'
import SourceLine from '../common/SourceLine'
import SummaryStats from '../common/SummaryStats'
import { CLUSTER_MIN_GROUPS, groupMarkers } from '../map/groupMarkers'
import MapLegend from '../map/MapLegend'
import NearbyMap from '../map/NearbyMap'
import AnalysisSection from './AnalysisSection'
import ConditionFilterBar from './ConditionFilterBar'
import FilterSummary from './nearby/FilterSummary'
import NearbyTable from './nearby/NearbyTable'
import PastViewBanner from './nearby/PastViewBanner'
import SnapshotBlock from './nearby/SnapshotBlock'

const T = MESSAGES.nearby
const FILTER_PANEL_ID = 'nearby-filter-panel'

/**
 * STEP 02 탭 ② 주변 점포 — F-03 지도 · F-04 필터 (/stores/nearby) · F-05 시점 조회 (/stores/snapshot).
 * 요약 → 지도 → 조건 칩 + [조건 변경] 패널 → 점포 표 → 시점 조회
 */
export default function NearbySection() {
  const { query } = useDiagnosisQuery()
  const asOfRangeMessage = useAsOfRangeMessage()
  const coords = getCoordinates(query)
  const params = coords ? toCommonQueryParams(query, coords) : null
  const nearby = useNearbyStores(params)
  // 선택 = 점포 식별값 storeKey(source, license_no). 지도 마커·정보창·표가 같은 값을 쓴다.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  // 반경·필터·시점이 바뀌면 이전 선택(강조·정보창)을 풀고 조건 패널을 닫는다 — 조건을 되돌려도 다시 살아나지 않게
  const paramsKey = JSON.stringify(params)
  const [selectedFor, setSelectedFor] = useState(paramsKey)
  if (selectedFor !== paramsKey) {
    setSelectedFor(paramsKey)
    setSelectedId(null)
    setFilterOpen(false)
  }
  const mapWrapRef = useRef<HTMLDivElement>(null)

  /** 표에서 고르면 지도가 보이게 올려 주고 마커를 강조한다 (id = storeKey) */
  const selectFromTable = (id: string) => {
    setSelectedId(id)
    mapWrapRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' })
  }

  const pastLabel = formatYearMonthKo(query.asOf)
  const data = nearby.data?.data
  const meta = nearby.data?.meta

  return (
    <AnalysisSection id="nearby">
      <PastViewBanner />

      {/* 서버 count·radius_m·as_of 그대로 (계산하지 않음) */}
      {data && (
        <SummaryStats
          label={MESSAGES.frame.summaryLabel(T.tabTitle)}
          items={[
            {
              key: 'count',
              label: T.statCount,
              value: formatCount(data.count, MESSAGES.units.store),
              icon: Store,
            },
            {
              key: 'radius',
              label: T.statRadius,
              value: `${data.radius_m.toLocaleString('ko-KR')}m`,
              icon: CircleDot,
            },
            { key: 'asOf', label: T.statAsOf, value: formatDate(data.as_of), icon: CalendarDays },
          ]}
        />
      )}

      <SectionCard
        title={T.mapTitle}
        footer={
          !nearby.isPending &&
          !nearby.isError &&
          data && (
            <SourceLine
              source={meta?.source}
              asOf={meta?.as_of}
              baseline={formatDataBaseline(meta)}
              space={meta?.space}
              denominator={meta?.denominator}
              isDemo={meta?.is_demo}
            />
          )
        }
      >
        {nearby.isPending ? (
          <LoadingSkeleton variant="map" />
        ) : nearby.isError ? (
          <ErrorState
            error={nearby.error}
            message={asOfRangeMessage(nearby.error) ?? undefined}
            // 범위 밖 시점은 다시 시도해도 같으므로 기간 안내만 (다시 시도 버튼 없음)
            onRetry={asOfRangeMessage(nearby.error) ? undefined : () => void nearby.refetch()}
          />
        ) : (
          data && (
            <>
              <div ref={mapWrapRef} className="scroll-mt-sticky-tabs">
                {/* 지도가 깨져도 아래 조회 조건·점포 표는 그대로 보인다 */}
                <SectionErrorBoundary resetKey={paramsKey}>
                  <NearbyMap
                    center={data.center}
                    radiusM={data.radius_m}
                    markers={data.markers ?? []}
                    badge={T.mapBadge(data.radius_m, formatDate(data.as_of))}
                    pastBadge={pastLabel ? T.pastBadge(pastLabel) : null}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                </SectionErrorBoundary>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-stack-1">
                <MapLegend {...legendFlags(data.markers ?? [])} />
                {/* 전체 수는 서버 count 그대로 */}
                <p className="text-caption font-semibold text-gray-900">{T.total(data.count)}</p>
              </div>
              {data.excluded_no_coord > 0 && (
                <p className="text-caption text-gray-600">
                  {T.excludedNoCoord(data.excluded_no_coord)}
                </p>
              )}
            </>
          )
        )}
      </SectionCard>

      {/* 점포 상세 조회 — 지금 조건 칩 + [조건 변경] 패널(반경을 바꾸면 위 지도도 함께 바뀜) + 점포 표 */}
      <SectionCard title={T.tableTitle}>
        <FilterSummary
          open={filterOpen}
          onToggle={() => setFilterOpen((o) => !o)}
          panelId={FILTER_PANEL_ID}
        />
        <div id={FILTER_PANEL_ID} hidden={!filterOpen}>
          {filterOpen && <ConditionFilterBar />}
        </div>
        {nearby.isPending ? (
          <LoadingSkeleton variant="table" />
        ) : nearby.isError ? null : (
          data &&
          (data.count === 0 || !data.markers?.length ? (
            <EmptyState
              message={
                franchiseEmptyMessage(query.franchise) ?? data.message ?? MESSAGES.common.empty
              }
            />
          ) : (
            <NearbyTable
              markers={data.markers}
              selectedId={selectedId}
              onSelect={selectFromTable}
            />
          ))
        )}
      </SectionCard>

      {/* 시점 조회 (F-05) — 지도·표가 실패해도 따로 보인다 */}
      <SectionCard>
        <SnapshotBlock />
      </SectionCard>
    </AnalysisSection>
  )
}

/** 범례에 묶음 항목을 넣을지 — 지도와 같은 묶음 규칙(groupMarkers)으로 판단 (표시용) */
function legendFlags(markers: Parameters<typeof groupMarkers>[0]) {
  const groups = groupMarkers(markers)
  return {
    hasGroups: groups.some((g) => g.stores.length > 1),
    hasMixed: groups.some((g) => g.status === 'mixed'),
    clustered: groups.length > CLUSTER_MIN_GROUPS,
  }
}
