import { ArrowRight, Home, MapPinOff } from 'lucide-react'
import { Link } from 'react-router'
import { MESSAGES } from '../constants/messages'
import { ROUTES } from '../constants/routes'
import { usePageTitle } from '../hooks/usePageTitle'

const T = MESSAGES.notFound

/** 찾을 수 없는 페이지 — 디자인 톤(연한 파란 배경 카드 + 파란 둥근 버튼) */
export default function NotFoundPage() {
  usePageTitle(MESSAGES.titles.notFound)
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col items-center px-10 py-24 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-blue-100 text-blue-500">
        <MapPinOff className="size-9" aria-hidden="true" />
      </span>
      <p className="mt-6 text-title font-extrabold text-blue-700">{T.code}</p>
      <h1 className="mt-2 text-section font-bold text-gray-900">{T.title}</h1>
      <p className="mt-2 text-body text-gray-600">{T.description}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to={ROUTES.landing}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-blue-600 px-6 text-body font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <Home className="size-5" aria-hidden="true" />
          {T.home}
        </Link>
        <Link
          to={ROUTES.input}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-blue-100 px-6 text-body font-semibold text-blue-700 hover:bg-blue-500/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {T.start}
          <ArrowRight className="size-5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
