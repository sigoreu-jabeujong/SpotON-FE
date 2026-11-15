import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Props = {
  icon: LucideIcon
  /** empty: 회색(결과 없음) · error: 빨강(불러오기·표시 실패) */
  tone: 'empty' | 'error'
  /** 한 줄 제목 — 무엇이 없는지·무엇이 안 됐는지 */
  title: string
  /** 한 줄 설명 — 왜 그런지·어떻게 하면 되는지 */
  description?: string | null
  /** 다음 행동 버튼 (다시 시도·조건 바꾸기·처음으로 중 맞는 것) */
  actions?: ReactNode
  /** 작은 덧붙임 (예: "오류 코드 404") */
  note?: string
  /** section: 화면 안 한 영역 / page: 화면 전체(404·오류 화면) */
  size?: 'section' | 'page'
  /** 제목 태그 — 화면 전체일 때는 h1, 영역 안에서는 p(제목 구조를 흐트러뜨리지 않게) */
  titleAs?: 'h1' | 'p'
  /** 오류는 role="alert"로 바로 알린다 (빈 결과는 알리지 않음) */
  role?: 'alert'
}

/**
 * 빈 결과·오류 화면 공통 모양 — 아이콘 + 한 줄 제목 + 한 줄 설명 + 다음 행동 버튼.
 * "판단 보류·정보 없음·자료 확인 중"은 빈 화면이 아니라 상태이므로 이 틀을 쓰지 않는다 (StatusLabel 등 기존 규칙)
 */
export default function StatePanel({
  icon: Icon,
  tone,
  title,
  description,
  actions,
  note,
  size = 'section',
  titleAs: Title = 'p',
  role,
}: Props) {
  const page = size === 'page'
  return (
    <div
      role={role}
      className={cn(
        'flex flex-col items-center text-center',
        page ? 'gap-3 px-10 py-24' : 'gap-2 px-4 py-10',
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center rounded-full',
          page ? 'mb-3 size-20' : 'mb-1 size-12',
          tone === 'error'
            ? 'bg-danger/10 text-danger'
            : // 화면 전체(404)는 회색 배경 위라 흰 원, 영역 안은 흰 카드 위라 회색 원
              page
              ? 'bg-gray-0 text-gray-600 shadow-card'
              : 'bg-gray-100 text-gray-600',
        )}
      >
        <Icon className={page ? 'size-9' : 'size-6'} aria-hidden="true" />
      </span>
      <Title className={cn('font-bold text-gray-900', page ? 'text-section' : 'text-subtitle')}>
        {title}
      </Title>
      {description && <p className="max-w-[44em] text-body text-gray-600">{description}</p>}
      {note && <p className="text-caption text-gray-600">{note}</p>}
      {actions && (
        <div className={cn('flex flex-wrap justify-center gap-3', page ? 'mt-5' : 'mt-2')}>
          {actions}
        </div>
      )}
    </div>
  )
}
