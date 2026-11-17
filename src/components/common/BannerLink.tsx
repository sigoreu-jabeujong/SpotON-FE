import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, type To } from 'react-router'
import { cn } from '../../utils/cn'

type Props = {
  to: To
  /** 화면 읽기 프로그램용 이동 안내 (카드 전체가 하나의 링크) */
  label: string
  /** 왼쪽 그림·아이콘 (40px) */
  art: ReactNode
  title: string
  desc: string
  onClick?: () => void
  className?: string
}

/**
 * 결과 화면 맨 아래 연한 파란 카드 링크 — 그림 + 제목·설명 + 오른쪽 화살표 원.
 * STEP 04 "다른 자리도 궁금하신가요?"(RediagnoseBanner)와 STEP 02·03 다음 단계 카드(NextStepCard)가 같은 모양을 쓴다.
 * 호버는 색·그림자 + 화살표 살짝(arrow-nudge), 키보드 포커스 테두리
 */
export default function BannerLink({ to, label, art, title, desc, onClick, className }: Props) {
  return (
    <Link
      to={to}
      aria-label={label}
      onClick={onClick}
      className={cn(
        'group flex items-center justify-between gap-4 rounded-card bg-blue-100 px-6 py-5 motion-colors hover:bg-blue-500/10 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        className,
      )}
    >
      <span className="flex items-center gap-4">
        {art}
        <span>
          <span className="block text-body font-bold text-gray-900">{title}</span>
          <span className="block text-caption text-gray-600">{desc}</span>
        </span>
      </span>
      <span className="flex size-10 shrink-0 arrow-nudge items-center justify-center rounded-full bg-gray-0 text-blue-500 shadow-card">
        <ArrowRight className="size-5" aria-hidden="true" />
      </span>
    </Link>
  )
}
