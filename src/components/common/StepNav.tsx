import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { MESSAGES } from '../../constants/messages'

type Props = {
  /** 이동할 경로 (진단 조건 쿼리는 search로 그대로 넘긴다) */
  to: string
  search: string
  label: string
}

/** 화면 맨 아래 "다음 단계" 이동 — 진단 조건(URL 쿼리)을 그대로 들고 간다 */
export default function StepNav({ to, search, label }: Props) {
  return (
    <nav
      aria-label={MESSAGES.frame.stepNav}
      className="flex justify-end border-t border-gray-300 pt-stack-3"
    >
      <Link
        to={{ pathname: to, search }}
        className="group inline-flex h-12 items-center gap-stack-1 rounded-full bg-blue-600 px-stack-4 text-body font-bold text-white motion-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        {label}
        <ArrowRight className="size-5 arrow-nudge" aria-hidden="true" />
      </Link>
    </nav>
  )
}
