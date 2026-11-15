import { MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { CURRENT_STATUS_LABEL, SUB_CATEGORY_LABEL } from '../../../constants/labels'
import { MESSAGES } from '../../../constants/messages'
import { useShowMore } from '../../../hooks/useShowMore'
import type { NearbyMarker, StoreStatus } from '../../../types/stores'
import { cn } from '../../../utils/cn'
import { formatArea, formatCount, formatDate } from '../../../utils/format'
import { storeName, storePeriod } from '../../../utils/storeDisplay'
import { storeKey } from '../../../utils/storeKey'
import Badge, { type BadgeTone } from '../../common/Badge'
import FranchiseNote from '../../common/FranchiseNote'
import SubCategoryNote from '../../common/SubCategoryNote'
import ShowMoreButton from '../../common/ShowMoreButton'
import StatusLabel from '../../common/StatusLabel'
import StoreFranchiseCell from '../../common/StoreFranchiseCell'
import StorePeriodCell from '../../common/StorePeriodCell'

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
  /** 행(점포명)을 누르면 지도에서 해당 마커를 강조·정보창 열기. id = storeKey(source, license_no) */
  onSelect: (id: string) => void
}

/** 주변 점포 표 — API 순서 그대로, 처음 5개 + 더보기 */
export default function NearbyTable({ markers, selectedId, onSelect }: Props) {
  const { visible, shown, total, hasMore, showMore } = useShowMore(markers)
  // API 순서가 가까운 순인지 확인만 한다 (값을 바꾸거나 다시 정렬하지 않음)
  const nearestFirst = useMemo(
    () =>
      markers.every(
        (m, i) =>
          m.distance_m !== null &&
          (i === 0 ||
            (markers[i - 1].distance_m !== null && markers[i - 1].distance_m! <= m.distance_m)),
      ),
    [markers],
  )

  return (
    <div>
      {nearestFirst && <p className="mb-2 text-right text-micro text-gray-600">{T.sortNearest}</p>}
      {/* 휴대폰: 표를 가로로 밀어 볼 수 있게 (이때 머리글 고정은 끈다). relative는 칸 속 sr-only 글자가 상자 밖 화면 폭을 넓히지 않게. 데스크톱은 그대로 */}
      <div className="overflow-clip rounded-card border border-gray-300 bg-gray-0 max-md:relative max-md:overflow-x-auto">
        <table
          id={TABLE_ID}
          // 숫자 열은 고정폭 숫자, 점포명(행 머리 th)은 보통 숫자 — 상호 속 숫자가 벌어지지 않게
          className="w-full text-center text-caption tabular-nums max-md:min-w-[720px] [&_tbody_th]:normal-nums"
        >
          <caption className="sr-only">{T.caption}</caption>
          {/* 머리글은 표가 길어도 진단 조건 바 바로 아래에 붙어 있다 (overflow-clip이라 sticky가 화면 기준으로 동작) */}
          <thead className="text-gray-900 [&_th]:sticky [&_th]:top-condition-bar [&_th]:z-[1] [&_th]:bg-blue-100 [&_th]:shadow-[inset_0_-1px_0_var(--color-gray-300)] max-md:[&_th]:static">
            <tr>
              {Object.values(T.columns).map((label) => (
                <th key={label} scope="col" className="px-3 py-3.5 font-bold whitespace-nowrap">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((m, i) => {
              // 관리번호가 같아도 원천이 다르면 다른 점포 — 키·선택 비교·클릭 인자 모두 source+license_no
              const id = storeKey(m.source, m.license_no)
              const selected = id === selectedId
              const name = storeName(m)
              const period = storePeriod(m)
              return (
                <tr
                  key={id}
                  onClick={() => {
                    if (m.lat !== null && m.lng !== null) onSelect(id)
                  }}
                  className={cn(
                    'cursor-pointer border-t border-gray-300/60 motion-colors first:border-t-0',
                    selected ? 'bg-blue-100' : 'hover:bg-blue-100/50',
                  )}
                >
                  <td className="px-3 py-4 text-gray-600">{i + 1}</td>
                  <th scope="row" className="px-3 py-4 font-semibold text-gray-900 max-md:min-w-28">
                    {/* 키보드: Tab으로 이동해 Enter → 지도에서 보기 */}
                    <button
                      disabled={m.lat === null || m.lng === null}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${name.text} ${T.showOnMap}`}
                      // 휴대폰에서는 한 줄 말줄임 — 잘린 전체 이름은 title로
                      title={name.text}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(id)
                      }}
                      className="inline-flex items-center gap-1 rounded hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 max-md:max-w-32"
                    >
                      {selected && (
                        <MapPin className="size-3.5 shrink-0 text-blue-500" aria-hidden="true" />
                      )}
                      <span
                        className={cn(
                          'max-md:line-clamp-1 max-md:break-all',
                          name.missing && 'font-normal text-gray-600',
                        )}
                      >
                        {name.text}
                      </span>
                    </button>
                  </th>
                  <td className="px-3 py-4">{SUB_CATEGORY_LABEL[m.sub_category]}</td>
                  <td className="px-3 py-4">
                    {formatCount(m.distance_m) ?? MESSAGES.store.missingValue}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {m.area_m2 === null ? <StatusLabel status="unknown" /> : formatArea(m.area_m2)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {formatDate(m.open_date) ?? MESSAGES.store.missingValue}
                  </td>
                  <td className="px-3 py-4">
                    <StorePeriodCell period={period} />
                  </td>
                  <td className="px-3 py-4">
                    <Badge tone={STATUS_TONE[m.current_status]}>
                      {CURRENT_STATUS_LABEL[m.current_status]}
                    </Badge>
                  </td>
                  <td className="px-3 py-4">
                    <StoreFranchiseCell store={m} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <FranchiseNote rows={markers} />
      <SubCategoryNote />
      <p className="sr-only" aria-live="polite">
        {MESSAGES.list.shownCount(shown, total)}
      </p>
      {hasMore && (
        <ShowMoreButton shown={shown} total={total} onClick={showMore} controls={TABLE_ID} />
      )}
    </div>
  )
}
