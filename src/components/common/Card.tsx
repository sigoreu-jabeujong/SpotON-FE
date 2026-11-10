import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type Props = HTMLAttributes<HTMLDivElement> & {
  /** 안쪽 여백 크기 */
  padding?: 'md' | 'lg'
}

/** 흰색 둥근 카드 */
export default function Card({ padding = 'lg', className, ...rest }: Props) {
  return (
    <div
      className={cn(
        'rounded-card bg-gray-0 shadow-card',
        padding === 'lg' ? 'p-8' : 'p-5',
        className,
      )}
      {...rest}
    />
  )
}
