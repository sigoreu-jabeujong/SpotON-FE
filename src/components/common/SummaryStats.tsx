import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export type SummaryStat = {
  /** 바뀌지 않는 키 (React key) */
  key: string
  label: string
  /** 형식 변환까지 끝난 서버 값 (예: "12곳"). null·빈 값이면 그 카드는 빼고 보여준다 */
  value: string | null | undefined
  icon?: LucideIcon
  /** 값 아래 작은 설명 (기간·사유 등) */
  hint?: ReactNode
}

type Props = {
  /** 화면 읽기 프로그램용 묶음 이름 (예: "주변 점포 요약") */
  label: string
  items: readonly SummaryStat[]
}

const COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

/**
 * 탭 맨 위 요약 숫자 줄 — 서버가 준 값을 형식만 바꿔 보여준다 (프론트에서 계산하지 않음).
 * 값이 없는 항목은 "0"이나 빈 카드로 두지 않고 카드 자체를 뺀다. 모두 없으면 아무것도 그리지 않는다.
 */
export default function SummaryStats({ label, items }: Props) {
  const shown = items.filter((i) => i.value !== null && i.value !== undefined && i.value !== '')
  if (shown.length === 0) return null
  return (
    <dl aria-label={label} className={cn('grid gap-stack-2', COLS[Math.min(shown.length, 4)])}>
      {shown.map(({ key, label: name, value, icon: Icon, hint }) => (
        <div
          key={key}
          className="flex min-w-0 flex-col gap-stack-1 rounded-card border border-gray-300 bg-gray-0 px-stack-3 py-stack-2"
        >
          <dt className="flex items-center gap-1.5 text-caption text-gray-600">
            {Icon && <Icon className="size-4 shrink-0 text-blue-500" aria-hidden="true" />}
            <span className="break-keep">{name}</span>
          </dt>
          <dd className="text-section leading-tight font-bold text-gray-900 tabular-nums">
            {value}
          </dd>
          {hint && <dd className="text-caption break-keep text-gray-600">{hint}</dd>}
        </div>
      ))}
    </dl>
  )
}
