import { useId, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import SubTitle from './SubTitle'

type Props = {
  /** 카드 소제목 (h3). 없으면 제목 없는 카드 — 안의 블록이 자기 소제목을 가질 때 */
  title?: ReactNode
  /** 소제목 오른쪽 요소 (예: 정렬 기준, 버튼) */
  right?: ReactNode
  children: ReactNode
  /** 카드 맨 아래 출처 한 줄 (SourceLine) — 가는 선으로 본문과 나눈다 */
  footer?: ReactNode
  className?: string
}

/** 흰 카드 한 장 = 내용 한 덩어리 (소제목 + 본문 + 하단 출처 한 줄). 카드 안 간격은 8px 단위 토큰만 쓴다 */
export default function SectionCard({ title, right, children, footer, className }: Props) {
  const titleId = useId()
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        'flex min-w-0 flex-col gap-stack-2 rounded-card border border-gray-300 bg-gray-0 p-stack-3',
        className,
      )}
    >
      {title && (
        <SubTitle id={titleId} right={right}>
          {title}
        </SubTitle>
      )}
      {children}
      {footer && <div className="border-t border-gray-300 pt-stack-2">{footer}</div>}
    </section>
  )
}
