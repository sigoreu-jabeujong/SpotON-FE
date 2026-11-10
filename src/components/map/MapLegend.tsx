import { CURRENT_STATUS_LABEL } from '../../constants/labels'
import { MESSAGES } from '../../constants/messages'
import type { StoreStatus } from '../../types/stores'
import { cn } from '../../utils/cn'
import { MARKER_COLOR } from './markerStyle'

const STATUSES: StoreStatus[] = ['open', 'closed', 'other']

/** 지도 범례 — 색 + 글자 (상태별 개수는 세지 않는다) */
export default function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-gray-900">
      <span className="font-semibold text-gray-600">{MESSAGES.nearby.legendTitle}</span>
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
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-3 rounded-full border-2 border-dashed border-blue-500 bg-blue-500/10"
          />
          {MESSAGES.nearby.legendRadius}
        </li>
      </ul>
    </div>
  )
}
