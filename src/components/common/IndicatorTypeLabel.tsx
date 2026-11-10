import { Calculator, Landmark } from 'lucide-react'
import { INDICATOR_TYPE, type IndicatorType } from '../../constants/labels'
import { cn } from '../../utils/cn'

type Props = { type: IndicatorType; className?: string }

/**
 * 지표 구분 라벨 — "서울시 공식" / "Spot:ON 참고지표"
 * 등급(좋음·나쁨)을 뜻하지 않도록 중립 색만 쓴다.
 */
export default function IndicatorTypeLabel({ type, className }: Props) {
  const official = type === 'official'
  const Icon = official ? Landmark : Calculator
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-micro font-semibold',
        official
          ? 'bg-blue-500 text-white'
          : 'bg-gray-0 text-gray-600 ring-1 ring-gray-300 ring-inset',
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {INDICATOR_TYPE[type]}
    </span>
  )
}
