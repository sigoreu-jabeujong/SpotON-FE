import { History } from 'lucide-react'
import { MESSAGES } from '../../../constants/messages'
import { formatYearMonthKo } from '../../../utils/format'

type Props = { asOf: string | null }

/** 과거 기준 시점을 보고 있을 때 섹션 안에 짧게 알려 주는 줄 (작업 7 배너의 간단한 형태) */
export default function PastViewNote({ asOf }: Props) {
  const label = formatYearMonthKo(asOf)
  if (!label) return null
  return (
    <p
      role="status"
      className="flex w-fit items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-caption font-bold text-orange-700"
    >
      <History className="size-4" aria-hidden="true" />
      {MESSAGES.nearby.pastView(label)}
    </p>
  )
}
