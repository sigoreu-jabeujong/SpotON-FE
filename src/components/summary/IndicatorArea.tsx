import type { ReactNode } from 'react'
import type { IndicatorType } from '../../constants/labels'
import { cn } from '../../utils/cn'
import IndicatorTypeLabel from '../common/IndicatorTypeLabel'

type Props = {
  type: IndicatorType
  title: string
  description: string
  children: ReactNode
}

/**
 * 지표 영역 — "서울시 공식"과 "Spot:ON 참고지표"를 시각적으로 분리한다.
 * 테두리 없이 배경색·여백으로만 구분: 공식은 옅은 파랑, 참고는 흰 바탕 (등급 색이 아니라 영역 구분용).
 * 영역 라벨(IndicatorTypeLabel)과 제목은 그대로
 */
export default function IndicatorArea({ type, title, description, children }: Props) {
  const official = type === 'official'
  const headingId = `indicator-area-${type}`
  return (
    <section
      aria-labelledby={headingId}
      className={cn('rounded-card p-6', official ? 'bg-blue-500/8' : 'bg-gray-0 shadow-card')}
    >
      <div className="flex flex-wrap items-center gap-2">
        <IndicatorTypeLabel type={type} />
        <h2 id={headingId} className="text-subtitle font-bold text-gray-900">
          {title}
        </h2>
      </div>
      <p className="mt-1 text-caption text-gray-600">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}
