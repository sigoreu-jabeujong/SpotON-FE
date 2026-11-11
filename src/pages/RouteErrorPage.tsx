import { CircleAlert, Home, RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useRouteError } from 'react-router'
import { MESSAGES } from '../constants/messages'
import { ROUTES } from '../constants/routes'

const T = MESSAGES.appError

/** 화면 전체가 그려지다 멈췄을 때 (router errorElement). 기술적인 오류 내용은 화면에 보여주지 않는다 */
export default function RouteErrorPage() {
  const error = useRouteError()

  useEffect(() => {
    if (import.meta.env.DEV) console.error('[화면 오류] 화면 표시 실패', error)
  }, [error])

  return (
    <main className="min-h-screen bg-bg">
      <div
        role="alert"
        className="mx-auto flex max-w-[1200px] flex-col items-center px-10 py-24 text-center"
      >
        <span className="flex size-20 items-center justify-center rounded-full bg-blue-100 text-blue-500">
          <CircleAlert className="size-9" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-section font-bold text-gray-900">{T.title}</h1>
        <p className="mt-2 text-body text-gray-600">{T.description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-blue-500 px-6 text-body font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            <RotateCw className="size-5" aria-hidden="true" />
            {T.reload}
          </button>
          {/* 화면 상태가 깨졌을 수 있어 페이지를 새로 불러오며 이동한다 (reloadDocument) */}
          <Link
            to={ROUTES.landing}
            reloadDocument
            className="inline-flex h-12 items-center gap-2 rounded-full bg-blue-100 px-6 text-body font-semibold text-blue-700 hover:bg-blue-500/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            <Home className="size-5" aria-hidden="true" />
            {T.home}
          </Link>
        </div>
      </div>
    </main>
  )
}
