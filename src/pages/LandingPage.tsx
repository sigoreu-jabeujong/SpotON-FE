import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { IMAGES } from '../assets/images'
import Logo from '../components/common/Logo'
import { MESSAGES } from '../constants/messages'
import { ROUTES } from '../constants/routes'

const T = MESSAGES.landing

/** ① 랜딩 — 로고, 제목, 시작 버튼, 오른쪽 전국 지도 그림 (1.Home) */
export default function LandingPage() {
  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-gray-0">
      <LandingMap />

      <header className="relative mx-auto w-full max-w-[1200px] px-10 pt-10">
        <Logo />
      </header>

      <main className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-10 pt-16">
        <p className="text-caption font-semibold text-blue-500">{T.slogan}</p>
        <h1 className="mt-3 text-[2.5rem] leading-tight font-bold text-gray-900">
          {T.titleLine1}
          <br />
          {T.titleLine2}
        </h1>
        <p className="mt-3 text-subtitle text-gray-600">{T.description}</p>
        <div className="mt-8">
          <Link
            to={ROUTES.input}
            className="inline-flex h-13 items-center gap-2 rounded-full bg-blue-500 px-7 text-subtitle font-semibold text-white shadow-card transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            {T.start}
            <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
        </div>
        <p className="mt-6 text-caption text-gray-600">{T.scope}</p>
      </main>

      <footer className="relative mx-auto w-full max-w-[1200px] px-10 pt-10 pb-8 text-micro text-gray-600">
        <p>{MESSAGES.layout.ageNotice}</p>
        <p className="mt-0.5">{MESSAGES.disclaimer}</p>
      </footer>
    </div>
  )
}

/** 오른쪽 전국 지도 그림. 이미지가 없으면 연한 파란 원형 그라데이션 임시 배경 */
function LandingMap() {
  if (IMAGES.landingMap) {
    return (
      <img
        src={IMAGES.landingMap}
        alt={T.mapAlt}
        className="pointer-events-none absolute right-0 bottom-0 h-[85%] max-w-[65%] object-contain"
      />
    )
  }
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-[18%] -right-[8%] aspect-[4/3] w-[62%] rounded-full bg-radial from-blue-500/20 via-blue-100/70 to-transparent"
    />
  )
}
