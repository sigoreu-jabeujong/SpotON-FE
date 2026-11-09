import { Link, Outlet } from 'react-router'
import { ROUTES } from '../../constants/routes'
import { MESSAGES } from '../../constants/messages'

/** 전체 공통 틀: 상단 로고 + 본문 + 하단 면책 문구. 디자인 시안 확정 후 스타일 적용 */
export default function AppLayout() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-gray-200 px-4 py-3">
        <Link to={ROUTES.landing} className="text-lg font-bold">
          Spot:ON
        </Link>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 px-4 py-3 text-xs text-gray-500">
        {MESSAGES.disclaimer}
      </footer>
    </div>
  )
}
