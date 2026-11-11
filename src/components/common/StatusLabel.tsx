import {
  CircleCheck,
  CircleHelp,
  CircleMinus,
  CirclePause,
  ExternalLink,
  MapPinOff,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { DATA_STATUS, type DataStatus } from '../../constants/labels'
import { cn } from '../../utils/cn'

const ICON: Record<DataStatus, LucideIcon> = {
  fact: CircleCheck,
  estimate: TrendingUp,
  no_data: CircleMinus,
  pending: CirclePause,
  unknown: CircleHelp,
  location_unverified: MapPinOff,
  link_only: ExternalLink,
}

const TONE: Record<(typeof DATA_STATUS)[DataStatus]['tone'], string> = {
  neutral: 'bg-status-neutral-bg text-status-neutral-fg',
  info: 'bg-status-info-bg text-status-info-fg',
  muted: 'bg-status-muted-bg text-status-muted-fg',
  warning: 'bg-status-warning-bg text-status-warning-fg',
}

type Props = {
  status: DataStatus
  /** 판단 보류·자료 없음 사유 (있으면 라벨 옆에 함께 표시) */
  reason?: string | null
  className?: string
}

/**
 * 상태 라벨 — 확인된 사실 / 통계적 추정 / 자료 없음 / 판단 보류 / 정보 없음 / 상세 위치 미확인 (+ 공식 사이트에서 확인)
 * 색만으로 구분하지 않고 아이콘과 글자를 항상 함께 보여준다.
 */
/** 상태 아이콘만 (값 자리에 "판단 보류·자료 없음"을 보여줄 때) */
export function StatusIcon({ status, className }: { status: DataStatus; className?: string }) {
  const Icon = ICON[status]
  return <Icon className={className} aria-hidden="true" />
}

export default function StatusLabel({ status, reason, className }: Props) {
  const { label, tone } = DATA_STATUS[status]
  const Icon = ICON[status]
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1.5', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-micro font-semibold whitespace-nowrap',
          TONE[tone],
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </span>
      {reason && <span className="text-caption text-gray-600">{reason}</span>}
    </span>
  )
}
