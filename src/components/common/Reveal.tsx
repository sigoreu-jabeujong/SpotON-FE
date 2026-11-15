import type { ReactNode } from 'react'
import { useRevealOnce } from '../../hooks/useRevealOnce'

/**
 * 화면에 처음 들어올 때 한 번만 살짝 떠오르며 등장하는 묶음 (결과 화면 카드 묶음용).
 * 인쇄용 진단서·요약 이미지에는 쓰지 않는다.
 */
export default function Reveal({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const [ref, state] = useRevealOnce<HTMLDivElement>()
  return (
    <div ref={ref} data-reveal={state} className={className}>
      {children}
    </div>
  )
}
