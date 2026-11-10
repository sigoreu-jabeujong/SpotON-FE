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
  primary: 'bg-blue-500 text-white hover:bg-blue-700',
  secondary: 'bg-blue-100 text-blue-700 hover:bg-blue-500/15',
}

const SIZE: Record<Size, string> = {
  md: 'h-10 px-4 text-body',
  lg: 'h-13 px-6 text-subtitle',
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
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        'disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600',
        VARIANT[variant],
        SIZE[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {children}
      {iconRight && <span aria-hidden="true">{iconRight}</span>}
    </button>
  )
}
