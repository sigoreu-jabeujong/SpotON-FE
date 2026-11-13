import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary'
type Size = 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  /** 글자 오른쪽 아이콘 (예: 화살표) */
  iconRight?: ReactNode
  fullWidth?: boolean
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  // 흰 바탕 + 파란 테두리 — 옅은 화면 배경 위에서도 버튼으로 보이게
  secondary: 'bg-gray-0 text-blue-700 ring-1 ring-blue-500/40 ring-inset hover:bg-blue-100',
}

/** 버튼 높이는 2단계만 — 40px(md, 카드 안·보조) / 48px(lg, 화면의 주요 행동) */
const SIZE: Record<Size, string> = {
  md: 'h-10 px-4 text-body',
  lg: 'h-12 px-6 text-subtitle',
}

/** 기본(파란)·보조(연한 파란) 버튼. disabled면 회색으로 비활성 */
export default function Button({
  variant = 'primary',
  size = 'md',
  iconRight,
  fullWidth,
  className,
  type = 'button',
  children,
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        'group inline-flex items-center justify-center gap-2 rounded-full font-semibold',
        // hover: 색 전환 + 살짝 떠오름, 누를 때 살짝 눌림 (동작 줄이기면 색만)
        'transition-[color,background-color,transform] duration-(--duration-fast) ease-(--ease-out-soft)',
        'motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        'disabled:transform-none disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600',
        VARIANT[variant],
        SIZE[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {children}
      {iconRight && (
        <span aria-hidden="true" className="arrow-nudge">
          {iconRight}
        </span>
      )}
    </button>
  )
}
