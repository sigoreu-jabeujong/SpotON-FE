import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export type BadgeTone = 'blue' | 'gray' | 'green' | 'orange' | 'pink' | 'purple'

const TONE: Record<BadgeTone, string> = {
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600 ring-1 ring-gray-300 ring-inset',
  green: 'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
  pink: 'bg-pink-100 text-pink-700',
  purple: 'bg-purple-100 text-purple-700',
}

type Props = {
  tone?: BadgeTone
  icon?: ReactNode
  children: ReactNode
  className?: string
}

/** 작은 둥근 배지 (예: 영업 중·폐업·프랜차이즈(추정)). 글자를 꼭 넣는다 */
export default function Badge({ tone = 'gray', icon, children, className }: Props) {
  return (
    <span
      className={cn(
        'text-micro inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold whitespace-nowrap',
        TONE[tone],
        className,
      )}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}
