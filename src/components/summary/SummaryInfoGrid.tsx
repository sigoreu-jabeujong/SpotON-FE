import { CalendarDays, Database, Info, UserX, type LucideIcon } from 'lucide-react'
import { MESSAGES } from '../../constants/messages'
import { parseSourceIds, SOURCES } from '../../constants/sources'
import type { ApiMeta } from '../../types/api'
import { formatDataBaseline } from '../../utils/format'

const T = MESSAGES.summary

/** 맨 아래 정보 4칸 — 데이터 기준일 / 출처 / 참고용 / 사업주 역량 미반영 */
export default function SummaryInfoGrid({ meta }: { meta: ApiMeta | null | undefined }) {
  const sources = parseSourceIds(meta?.source)
    .map((id) => `${SOURCES[id]?.name ?? id}(${id})`)
    .join(', ')
  const cells: { icon: LucideIcon; title: string; text: string }[] = [
    {
      icon: CalendarDays,
      title: T.infoBaseline,
      text: formatDataBaseline(meta) ?? MESSAGES.layout.baselinePending,
    },
    { icon: Database, title: T.infoSource, text: sources || '—' },
    { icon: Info, title: T.infoReference, text: T.infoReferenceText },
    { icon: UserX, title: T.infoOwner, text: T.infoOwnerText },
  ]
  return (
    <section
      aria-label={T.infoTitle}
      className="grid grid-cols-4 divide-x divide-gray-300 rounded-control border border-gray-300 bg-gray-0"
    >
      {cells.map(({ icon: Icon, title, text }) => (
        <div key={title} className="px-5 py-4">
          <p className="flex items-center gap-1.5 text-caption font-bold text-gray-900">
            <Icon className="size-4 text-blue-500" aria-hidden="true" />
            {title}
          </p>
          <p className="mt-1 text-micro break-keep text-gray-600">{text}</p>
        </div>
      ))}
    </section>
  )
}
