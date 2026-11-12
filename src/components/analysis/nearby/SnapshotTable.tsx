import { CURRENT_STATUS_LABEL, SUB_CATEGORY_LABEL } from '../../../constants/labels'
import { MESSAGES } from '../../../constants/messages'
import { useShowMore } from '../../../hooks/useShowMore'
import type { SnapshotStore, StoreStatus } from '../../../types/stores'
import { cn } from '../../../utils/cn'
import { storeCloseDate, storeName, storeOpenDate, storePeriod } from '../../../utils/storeDisplay'
import { storeKey } from '../../../utils/storeKey'
import Badge, { type BadgeTone } from '../../common/Badge'
import ShowMoreButton from '../../common/ShowMoreButton'
import StorePeriodCell from '../../common/StorePeriodCell'

const T = MESSAGES.snapshot
const TABLE_ID = 'snapshot-table'
/** 값이 없을 때(정보 없음·확인 필요) — 흐린 글씨로 실제 값과 구분 */
const missingClass = 'text-gray-600'
const STATUS_TONE: Record<StoreStatus, BadgeTone> = {
  open: 'blue',
  closed: 'pink',
  other: 'orange',
}

type Props = { stores: SnapshotStore[]; periodLabel: string }

/** 시점 조회 점포 목록 — API 순서 그대로, 처음 5개 + 더보기 */
export default function SnapshotTable({ stores, periodLabel }: Props) {
  const { visible, shown, total, hasMore, showMore } = useShowMore(stores)
  return (
    <div>
      <div className="overflow-hidden rounded-control border border-gray-300">
        <table id={TABLE_ID} className="w-full text-center text-caption">
          <caption className="sr-only">{T.caption(periodLabel)}</caption>
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
              const close = storeCloseDate(s, s.current_status)
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
                    <StorePeriodCell period={storePeriod(s)} />
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={STATUS_TONE[s.current_status]}>
                      {CURRENT_STATUS_LABEL[s.current_status]}
                    </Badge>
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
