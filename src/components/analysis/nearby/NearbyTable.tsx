import { MapPin } from 'lucide-react'
import { useMemo } from 'react'
import {
  CURRENT_STATUS_LABEL,
  FRANCHISE_LABEL,
  SUB_CATEGORY_LABEL,
} from '../../../constants/labels'
import { MESSAGES } from '../../../constants/messages'
import { useShowMore } from '../../../hooks/useShowMore'
import type { FranchiseStatus, NearbyMarker, StoreStatus } from '../../../types/stores'
import { cn } from '../../../utils/cn'
import { formatArea, formatCount, formatDate, formatOperatingMonths } from '../../../utils/format'
import Badge, { type BadgeTone } from '../../common/Badge'
import ShowMoreButton from '../../common/ShowMoreButton'
import StatusLabel from '../../common/StatusLabel'

const T = MESSAGES.nearby
const TABLE_ID = 'nearby-table'
const STATUS_TONE: Record<StoreStatus, BadgeTone> = {
  open: 'blue',
  closed: 'pink',
  other: 'orange',
}

type Props = {
  markers: NearbyMarker[]
  selectedId: string | null
  /** 행(점포명)을 누르면 지도에서 해당 마커를 강조·정보창 열기 */
  onSelect: (id: string) => void
}

/** 주변 점포 표 — API 순서 그대로, 처음 5개 + 더보기 */
export default function NearbyTable({ markers, selectedId, onSelect }: Props) {
  const { visible, shown, total, hasMore, showMore } = useShowMore(markers)
  // API 순서가 가까운 순인지 확인만 한다 (값을 바꾸거나 다시 정렬하지 않음)
  const nearestFirst = useMemo(
    () => markers.every((m, i) => i === 0 || markers[i - 1].distance_m <= m.distance_m),
    [markers],
  )

  return (
    <div>
      {nearestFirst && <p className="mb-2 text-right text-micro text-gray-600">{T.sortNearest}</p>}
      <div className="overflow-hidden rounded-control border border-gray-300">
        <table id={TABLE_ID} className="w-full text-center text-caption">
          <caption className="sr-only">{T.caption}</caption>
          <thead className="bg-blue-100 text-gray-900">
            <tr>
              {Object.values(T.columns).map((label) => (
                <th key={label} scope="col" className="px-3 py-3 font-semibold whitespace-nowrap">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((m, i) => {
              const selected = m.license_no === selectedId
              return (
                <tr
                  key={m.license_no}
                  onClick={() => onSelect(m.license_no)}
                  className={cn(
                    'cursor-pointer border-t border-gray-300 transition-colors',
                    selected ? 'bg-blue-100' : 'even:bg-gray-100/60 hover:bg-blue-100/50',
                  )}
                >
                  <td className="px-3 py-3 text-gray-600">{i + 1}</td>
                  <th scope="row" className="px-3 py-3 font-semibold text-gray-900">
                    {/* 키보드: Tab으로 이동해 Enter → 지도에서 보기 */}
                    <button
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${m.name} ${T.showOnMap}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(m.license_no)
                      }}
                      className="inline-flex items-center gap-1 rounded hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                    >
                      {selected && <MapPin className="size-3.5 text-blue-500" aria-hidden="true" />}
                      {m.name}
                    </button>
                  </th>
                  <td className="px-3 py-3">{SUB_CATEGORY_LABEL[m.sub_category]}</td>
                  <td className="px-3 py-3">{formatCount(m.distance_m)}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {m.area_m2 === null ? <StatusLabel status="unknown" /> : formatArea(m.area_m2)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{formatDate(m.open_date)}</td>
                  <td className="px-3 py-3 font-semibold whitespace-nowrap">
                    {formatOperatingMonths(m.operating_months)}
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={STATUS_TONE[m.current_status]}>
                      {CURRENT_STATUS_LABEL[m.current_status]}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <FranchiseCell franchise={m.franchise} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="sr-only" aria-live="polite">
        {MESSAGES.list.shownCount(shown, total)}
      </p>
      {hasMore && (
        <ShowMoreButton shown={shown} total={total} onClick={showMore} controls={TABLE_ID} />
      )}
    </div>
  )
}

function FranchiseCell({ franchise }: { franchise: FranchiseStatus }) {
  if (franchise === 'unknown') return <StatusLabel status="unknown" />
  return (
    <Badge tone={franchise === 'franchise' ? 'blue' : 'gray'}>{FRANCHISE_LABEL[franchise]}</Badge>
  )
}
