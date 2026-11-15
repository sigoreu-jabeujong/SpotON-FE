import { CURRENT_STATUS_LABEL } from '../../constants/labels'
import { MESSAGES } from '../../constants/messages'
import type { StoreStatus } from '../../types/stores'
import { cn } from '../../utils/cn'
import { MARKER_COLOR, MIXED_COLOR } from './markerStyle'

const STATUSES: StoreStatus[] = ['open', 'closed', 'other']

type Props = {
  /** 같은 좌표 묶음(숫자 배지)이 있을 때 */
  hasGroups?: boolean
  /** 묶음 안 상태가 섞인 마커가 있을 때 */
  hasMixed?: boolean
  /** 마커가 많아 가까운 것끼리 큰 원으로 묶었을 때 */
  clustered?: boolean
}

/** 지도 범례 — 색 + 글자 (상태별 개수는 세지 않는다). 묶음 항목은 지도에 있을 때만 */
export default function MapLegend({ hasGroups, hasMixed, clustered }: Props) {
  const T = MESSAGES.nearby
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-gray-900">
      <span className="font-semibold text-gray-600">{T.legendTitle}</span>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {STATUSES.map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn(
                'size-3 rounded-full border-2 border-white shadow',
                MARKER_COLOR[s].dot,
              )}
            />
            {CURRENT_STATUS_LABEL[s]}
          </li>
        ))}
        {hasMixed && (
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn('size-3 rounded-full border-2 border-white shadow', MIXED_COLOR.dot)}
            />
            {T.legendMixed}
          </li>
        )}
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-3 rounded-full border-2 border-dashed border-blue-500 bg-blue-500/10"
          />
          {T.legendRadius}
        </li>
        {hasGroups && (
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="flex size-4 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-[8px] font-bold text-white shadow"
            >
              3
            </span>
            {T.legendGroup}
          </li>
        )}
        {clustered && (
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-4 rounded-full border-2 border-white bg-blue-700/85 shadow"
            />
            {T.legendCluster}
          </li>
        )}
      </ul>
    </div>
  )
}
