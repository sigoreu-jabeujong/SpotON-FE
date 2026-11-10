import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

type Props = {
  label: string
  /** 형식 변환까지 끝난 서버 값 (예: "12곳"). 없으면 "—" */
  value: string | null
  icon: LucideIcon
  /** 강조하지 않는 중립 카드가 기본 (참고지표 등급 색 금지 원칙) */
  className?: string
}

/** 숫자 카드 — 아이콘 원 + 라벨 + 큰 숫자 (디자인 "점포 현황" 카드 모양) */
export default function StatCard({ label, value, icon: Icon, className }: Props) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-control border border-gray-300 bg-gray-0 px-5 py-4',
        className,
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-caption text-gray-600">{label}</p>
        <p className="text-title leading-tight font-bold text-gray-900">{value ?? '—'}</p>
      </div>
    </div>
  )
}
