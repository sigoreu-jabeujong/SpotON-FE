import { useMemo } from 'react'
import {
  FRANCHISE_LABEL,
  LOCATION_MATCH_LABEL,
  STORE_STATUS_LABEL,
  SUB_CATEGORY_LABEL,
} from '../../../constants/labels'
import { MESSAGES } from '../../../constants/messages'
import { useShowMore } from '../../../hooks/useShowMore'
import type {
  FranchiseStatus,
  HistoryStore,
  LocationMatch,
  StoreStatus,
} from '../../../types/stores'
import { formatDate, formatOperatingMonths } from '../../../utils/format'
import Badge, { type BadgeTone } from '../../common/Badge'
import ShowMoreButton from '../../common/ShowMoreButton'
import StatusLabel from '../../common/StatusLabel'

const T = MESSAGES.history
const TABLE_ID = 'history-table'

const STATUS_TONE: Record<StoreStatus, BadgeTone> = {
  open: 'green',
  closed: 'gray',
  other: 'orange',
}

type Props = { stores: HistoryStore[] }

/** 과거 점포 이력 표 — 최근 개업 순, 처음 5개 + 더보기 */
export default function HistoryTable({ stores }: Props) {
  // 표시 순서만 바꾼다 (API는 인허가일 오름차순). 값은 계산하지 않는다.
  const sorted = useMemo(
    () => [...stores].sort((a, b) => b.open_date.localeCompare(a.open_date)),
    [stores],
  )
  const { visible, shown, total, hasMore, showMore } = useShowMore(sorted)

  return (
    <div>
      <p className="mb-2 text-right text-micro text-gray-600">{T.sortLabel}</p>
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
            {visible.map((s, i) => (
              <tr
                key={s.license_no}
                className="border-t border-gray-300 motion-colors even:bg-gray-100/60 hover:bg-blue-100/40"
              >
                <td className="px-3 py-3 text-gray-600">{i + 1}</td>
                <th scope="row" className="px-3 py-3 font-semibold text-gray-900">
                  {s.name}
                </th>
                <td className="px-3 py-3">{SUB_CATEGORY_LABEL[s.sub_category]}</td>
                <td className="px-3 py-3 whitespace-nowrap">{formatDate(s.open_date)}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {s.close_date ? (
                    formatDate(s.close_date)
                  ) : (
                    <>
                      <span aria-hidden="true">—</span>
                      <span className="sr-only">{T.noCloseDate}</span>
                    </>
                  )}
                </td>
                <td className="px-3 py-3 font-semibold whitespace-nowrap">
                  {formatOperatingMonths(s.operating_months)}
                </td>
                <td className="px-3 py-3">
                  <Badge tone={STATUS_TONE[s.store_status]}>
                    {STORE_STATUS_LABEL[s.store_status]}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <LocationCell match={s.location_match} />
                </td>
                <td className="px-3 py-3">
                  <FranchiseCell franchise={s.franchise} />
                </td>
              </tr>
            ))}
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

/** 위치 일치 — 미확인은 상태 라벨로 누락 없이 표시 */
function LocationCell({ match }: { match: LocationMatch }) {
  if (match === 'unverified') return <StatusLabel status="location_unverified" />
  return <Badge tone={match === 'same_spot' ? 'blue' : 'gray'}>{LOCATION_MATCH_LABEL[match]}</Badge>
}

/** 프랜차이즈 — 정보 없음은 상태 라벨(unknown) */
function FranchiseCell({ franchise }: { franchise: FranchiseStatus }) {
  if (franchise === 'unknown') return <StatusLabel status="unknown" />
  return (
    <Badge tone={franchise === 'franchise' ? 'blue' : 'gray'}>{FRANCHISE_LABEL[franchise]}</Badge>
  )
}
