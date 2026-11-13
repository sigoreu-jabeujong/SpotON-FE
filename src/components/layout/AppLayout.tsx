import { Outlet } from 'react-router'
import { MESSAGES } from '../../constants/messages'
import Logo from '../common/Logo'
import SkipLink, { MAIN_ID } from '../common/SkipLink'

/** 기본 틀 (랜딩·입력·결과 외 화면, 예: 찾을 수 없는 페이지): 로고 + 본문 + 면책 문구 */
export default function AppLayout() {
  return (
    <div className="flex min-h-full flex-col">
      <SkipLink />
      <header className="mx-auto w-full max-w-[1200px] px-10 pt-10">
        <Logo />
      </header>
      <main id={MAIN_ID} tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <footer className="mx-auto w-full max-w-[1200px] px-10 py-6 text-micro text-gray-600">
        {MESSAGES.disclaimer}
      </footer>
    </div>
  )
}
