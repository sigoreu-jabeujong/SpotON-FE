import { useMemo } from 'react'
import { historyStatusLabel } from '../../../utils/history'
import { SUB_CATEGORY_LABEL } from '../../../constants/labels'
import { MESSAGES } from '../../../constants/messages'
import { useShowMore } from '../../../hooks/useShowMore'
import type { HistoryStore } from '../../../types/stores'
import { cn } from '../../../utils/cn'
import { storeCloseDate, storeName, storeOpenDate, storePeriod } from '../../../utils/storeDisplay'
import { storeKey } from '../../../utils/storeKey'
import { locationRelationLabel } from '../../../utils/locationRelationLabel'
import StoreReferenceCell from '../../common/StoreReferenceCell'
import ShowMoreButton from '../../common/ShowMoreButton'

const T = MESSAGES.history
const TABLE_ID = 'history-table'
/** 값이 없을 때(정보 없음·확인 필요) — 흐린 글씨로 실제 값과 구분 */
const missingClass = 'text-gray-600'

type Props = {
  asOf?: string | null
  stores: HistoryStore[]
}

/** 과거 점포 이력 표 — 최근 개업 순, 처음 5개 + 더보기 */
export default function HistoryTable({ stores, asOf }: Props) {
  // 표시 순서만 바꾼다 (진단서와 같은 정렬 — 개업일 미확인은 맨 뒤). 캐시 배열은 복사해 정렬
  const sorted = useMemo(() => [...stores], [stores])
  const { visible, shown, total, hasMore, showMore } = useShowMore(sorted)

  return (
    <div>
      <p className="mb-2 text-right text-micro text-gray-600">
        최근 개업 순 · 날짜 미확인 기록은 마지막
      </p>
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
            {visible.map((s, i) => {
              const name = storeName(s)
              const open = storeOpenDate(s)
              const close = storeCloseDate(s, s.store_status)
              const period = storePeriod(s)
              return (
                <tr
                  // 관리번호가 같아도 원천이 다르면 다른 점포 — source+license_no로 구분
                  key={storeKey(s.source, s.license_no)}
                  className="border-t border-gray-300/60 motion-colors first:border-t-0 hover:bg-blue-100/50"
                >
                  <td className="px-3 py-4 text-gray-600">{i + 1}</td>
                  <th
                    scope="row"
                    // 휴대폰에서는 한 줄 말줄임 — 잘린 전체 이름은 title로
                    title={name.text}
                    className={cn(
                      'px-3 py-4 max-md:min-w-28',
                      name.missing ? missingClass : 'font-semibold text-gray-900',
                    )}
                  >
                    <span className="max-md:mx-auto max-md:line-clamp-1 max-md:max-w-32 max-md:break-all">
                      {name.text}
                    </span>
                    <span className="mt-1 block text-micro font-normal text-gray-600">
                      {locationRelationLabel(s)}
                    </span>
                  </th>
                  <td className="px-3 py-4">{SUB_CATEGORY_LABEL[s.sub_category]}</td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {historyStatusLabel(s.store_status)}
                  </td>
                  <td className={cn('px-3 py-4 whitespace-nowrap', open.missing && missingClass)}>
                    {open.text}
                  </td>
                  <td className={cn('px-3 py-4 whitespace-nowrap', close?.missing && missingClass)}>
                    {close ? (
                      close.text
                    ) : (
                      <>
                        <span aria-hidden="true">—</span>
                        <span className="sr-only">{T.noCloseDate}</span>
                      </>
                    )}
                  </td>
                  <td className="px-3 py-4">
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
                  <td className="px-3 py-4">
                    <StoreReferenceCell asOf={asOf} />
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
