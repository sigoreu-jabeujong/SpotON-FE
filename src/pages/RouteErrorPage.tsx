import { CircleAlert, Home, RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useRouteError } from 'react-router'
import { MESSAGES } from '../constants/messages'
import { ROUTES } from '../constants/routes'
import StatePanel from '../components/common/StatePanel'

const T = MESSAGES.appError

/** 화면 전체가 그려지다 멈췄을 때 (router errorElement). 기술적인 오류 내용은 화면에 보여주지 않는다 */
export default function RouteErrorPage() {
  const error = useRouteError()

  useEffect(() => {
    if (import.meta.env.DEV) console.error('[화면 오류] 화면 표시 실패', error)
  }, [error])

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-[1200px]">
        <StatePanel
          role="alert"
          size="page"
          titleAs="h1"
          icon={CircleAlert}
          tone="error"
          title={T.title}
          description={T.description}
          actions={
            <>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-blue-600 px-6 text-body font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                <RotateCw className="size-5" aria-hidden="true" />
                {T.reload}
              </button>
              {/* 화면 상태가 깨졌을 수 있어 페이지를 새로 불러오며 이동한다 (reloadDocument) */}
              <Link
                to={ROUTES.landing}
                reloadDocument
                className="inline-flex h-12 items-center gap-2 rounded-full bg-gray-0 px-6 text-body font-semibold text-blue-700 ring-1 ring-blue-500/40 ring-inset hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                <Home className="size-5" aria-hidden="true" />
                {T.home}
              </Link>
            </>
          }
        />
      </div>
    </main>
  )
}
