import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { MESSAGES } from '../../constants/messages'

type Target = { to: string; label: string }

type Props = {
  /** 진단 조건 쿼리 — 이전·다음 링크 모두 그대로 들고 간다 */
  search: string
  /** 이전 단계 (선택) */
  prev?: Target
  /** 다음 단계 */
  next: Target
}

/** 화면 맨 아래 "이전 / 다음 단계 →" 이동 — 진단 조건(URL 쿼리)을 그대로 들고 간다 */
export default function StepNav({ search, prev, next }: Props) {
  return (
    <nav
      aria-label={MESSAGES.frame.stepNav}
      className="flex items-center justify-between gap-stack-2 border-t border-gray-300 pt-stack-3"
    >
      {prev ? (
        <Link
          to={{ pathname: prev.to, search }}
          className="group inline-flex h-12 items-center gap-stack-1 rounded-full px-stack-2 text-body font-semibold text-gray-600 motion-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
          {prev.label}
        </Link>
      ) : (
        <span />
      )}
      <Link
        to={{ pathname: next.to, search }}
        className="group inline-flex h-12 items-center gap-stack-1 rounded-full bg-blue-600 px-stack-4 text-body font-bold text-white motion-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        {next.label}
        <ArrowRight className="size-5 arrow-nudge" aria-hidden="true" />
      </Link>
    </nav>
  )
}
