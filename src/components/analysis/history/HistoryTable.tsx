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
import { cn } from '../../../utils/cn'
import { sortHistoryRecentFirst } from '../../../utils/history'
import { storeCloseDate, storeName, storeOpenDate, storePeriod } from '../../../utils/storeDisplay'
import { storeKey } from '../../../utils/storeKey'
import Badge, { type BadgeTone } from '../../common/Badge'
import ShowMoreButton from '../../common/ShowMoreButton'
import StatusLabel from '../../common/StatusLabel'

const T = MESSAGES.history
const TABLE_ID = 'history-table'
/** 값이 없을 때(정보 없음·확인 필요) — 흐린 글씨로 실제 값과 구분 */
const missingClass = 'text-gray-600'

const STATUS_TONE: Record<StoreStatus, BadgeTone> = {
  open: 'green',
  closed: 'gray',
  other: 'orange',
}

type Props = { stores: HistoryStore[] }

/** 과거 점포 이력 표 — 최근 개업 순, 처음 5개 + 더보기 */
export default function HistoryTable({ stores }: Props) {
  // 표시 순서만 바꾼다 (진단서와 같은 정렬 — 개업일 미확인은 맨 뒤). 캐시 배열은 복사해 정렬
  const sorted = useMemo(() => sortHistoryRecentFirst(stores), [stores])
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
            {visible.map((s, i) => {
              const name = storeName(s)
              const open = storeOpenDate(s)
              const close = storeCloseDate(s, s.store_status)
              const period = storePeriod(s)
              return (
                <tr
                  // 관리번호가 같아도 원천이 다르면 다른 점포 — source+license_no로 구분
                  key={storeKey(s.source, s.license_no)}
                  className="border-t border-gray-300 motion-colors even:bg-gray-100/60 hover:bg-blue-100/40"
                >
                  <td className="px-3 py-3 text-gray-600">{i + 1}</td>
                  <th
                    scope="row"
                    className={cn(
                      'px-3 py-3',
                      name.missing ? missingClass : 'font-semibold text-gray-900',
                    )}
                  >
                    {name.text}
                  </th>
                  <td className="px-3 py-3">{SUB_CATEGORY_LABEL[s.sub_category]}</td>
                  <td className={cn('px-3 py-3 whitespace-nowrap', open.missing && missingClass)}>
                    {open.text}
                  </td>
                  <td className={cn('px-3 py-3 whitespace-nowrap', close?.missing && missingClass)}>
                    {close ? (
                      close.text
                    ) : (
                      <>
                        <span aria-hidden="true">—</span>
                        <span className="sr-only">{T.noCloseDate}</span>
                      </>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {period.missing ? (
                      <>
                        <span className={cn('whitespace-nowrap', missingClass)}>{period.text}</span>
                        {/* 미산정 사유 — 0개월로 바꾸지 않고 왜 기간이 없는지 보여준다 */}
                        {period.reason && (
                          <span className="mt-0.5 block text-micro break-keep text-gray-600">
                            {period.reason}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="font-semibold whitespace-nowrap">{period.text}</span>
                    )}
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
