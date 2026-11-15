import { Home, MapPinOff } from 'lucide-react'
import { Link } from 'react-router'
import { MESSAGES } from '../constants/messages'
import { ROUTES } from '../constants/routes'
import { usePageTitle } from '../hooks/usePageTitle'
import StatePanel from '../components/common/StatePanel'

const T = MESSAGES.notFound

const PRIMARY =
  'inline-flex h-12 items-center gap-2 rounded-full bg-blue-600 px-6 text-body font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'
const SECONDARY =
  'inline-flex h-12 items-center gap-2 rounded-full bg-gray-0 px-6 text-body font-semibold text-blue-700 ring-1 ring-blue-500/40 ring-inset hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'

/** 찾을 수 없는 페이지 — 빈 결과·오류 화면과 같은 모양(StatePanel): 아이콘 + 제목 + 설명 + 처음으로 */
export default function NotFoundPage() {
  usePageTitle(MESSAGES.titles.notFound)
  return (
    <div className="mx-auto max-w-[1200px]">
      <StatePanel
        size="page"
        titleAs="h1"
        icon={MapPinOff}
        tone="empty"
        title={T.title}
        description={T.description}
        note={T.note(T.code)}
        actions={
          <>
            <Link to={ROUTES.landing} className={PRIMARY}>
              <Home className="size-5" aria-hidden="true" />
              {T.home}
            </Link>
            <Link to={ROUTES.input} className={SECONDARY}>
              {T.start}
            </Link>
          </>
        }
      />
    </div>
  )
}
