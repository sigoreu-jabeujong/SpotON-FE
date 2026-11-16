import type { ReactNode } from 'react'
import type { IndicatorType } from '../../constants/labels'
import { cn } from '../../utils/cn'
import { Calculator, Landmark } from 'lucide-react'

type Props = {
  type: IndicatorType
  title: string
  description: string
  children: ReactNode
}

/**
 * 지표 영역 — "서울시 공식"과 "Spot:ON 참고지표"를 시각적으로 분리한다.
 * 테두리 없이 배경색·여백으로만 구분: 공식은 옅은 파랑, 참고는 흰 바탕 (등급 색이 아니라 영역 구분용).
 * 머리는 아이콘 + 제목 하나 — 예전 알약 라벨(IndicatorTypeLabel)은 제목과 같은 글자라 뺐다
 */
export default function IndicatorArea({ type, title, description, children }: Props) {
  const official = type === 'official'
  const headingId = `indicator-area-${type}`
  const Icon = official ? Landmark : Calculator
  return (
    <section
      aria-labelledby={headingId}
      className={cn('rounded-card p-6', official ? 'bg-blue-500/8' : 'bg-gray-0 shadow-card')}
    >
      <h2
        id={headingId}
        className="flex items-center gap-1.5 text-subtitle font-bold text-gray-900"
      >
        <Icon
          className={cn('size-4.5 shrink-0', official ? 'text-blue-600' : 'text-gray-600')}
          aria-hidden="true"
        />
        {title}
      </h2>
      <p className="mt-1 text-caption text-gray-600">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}
