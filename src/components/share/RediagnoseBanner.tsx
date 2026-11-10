import { ArrowRight, MapPinned } from 'lucide-react'
import { Link } from 'react-router'
import { MESSAGES } from '../../constants/messages'
import { ROUTES } from '../../constants/routes'

const T = MESSAGES.share

/**
 * 새 주소 재진단 (F-10) — 진단 조건 쿼리 없이 /diagnose로 이동해 입력값을 비운 상태로 시작한다.
 * (주소·업종·좌표·건물 키·필터·기준 시점 모두 초기화)
 */
export default function RediagnoseBanner() {
  return (
    <Link
      to={ROUTES.input}
      aria-label={T.rediagnoseLabel}
      className="group flex items-center justify-between gap-4 rounded-card bg-blue-100 px-6 py-5 transition-colors hover:bg-blue-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
    >
      <span className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-0 text-blue-500 shadow-card">
          <MapPinned className="size-6" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-body font-bold text-gray-900">{T.rediagnoseTitle}</span>
          <span className="block text-caption text-gray-600">{T.rediagnoseDesc}</span>
        </span>
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-0 text-blue-500 shadow-card transition-transform group-hover:translate-x-0.5">
        <ArrowRight className="size-5" aria-hidden="true" />
      </span>
    </Link>
  )
}
