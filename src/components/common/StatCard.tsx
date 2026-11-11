import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Props = {
  label: string
  /** 형식 변환까지 끝난 서버 값 (예: "12곳"). 없으면 "—" (children을 주면 무시) */
  value?: string | null
  icon: LucideIcon
  /** 라벨 옆 작은 표식 (예: "Spot:ON 참고지표" 라벨) */
  badge?: ReactNode
  /** 숫자 아래 작은 설명 (예: 기간, 상태 라벨) */
  footer?: ReactNode
  /** 숫자 하나 대신 직접 그릴 내용 (예: 세부 업종별 목록) */
  children?: ReactNode
  /** 강조하지 않는 중립 카드가 기본 (참고지표 등급 색 금지 원칙) */
  className?: string
}

/** 숫자 카드 — 아이콘 원 + 라벨 + 큰 숫자 (디자인 "점포 현황" 카드 모양) */
export default function StatCard({
  label,
  value,
  icon: Icon,
  badge,
  footer,
  children,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-control border border-gray-300 bg-gray-0 p-5',
        className,
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-caption text-gray-600">{label}</p>
          {badge}
        </div>
        {children ?? (
          <p className="text-title leading-tight font-bold text-gray-900">{value ?? '—'}</p>
        )}
        {footer && <div className="mt-1 text-micro text-gray-600">{footer}</div>}
      </div>
    </div>
  )
}
