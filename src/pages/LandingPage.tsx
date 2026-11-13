import { ArrowRight, ChevronDown } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { IMAGES } from '../assets/images'
import Logo from '../components/common/Logo'
import LandingSections from '../components/landing/LandingSections'
import SiteFooter from '../components/layout/SiteFooter'
import { MESSAGES } from '../constants/messages'
import { ROUTES } from '../constants/routes'
import { usePageTitle } from '../hooks/usePageTitle'
import SkipLink, { MAIN_ID } from '../components/common/SkipLink'

const T = MESSAGES.landing

/**
 * 첫 진입 때 제목 → 설명 → 버튼 → 지도 순서로 한 번 떠오르며 등장.
 * 순서 n번째 요소는 --duration-stagger × n 만큼 늦게 시작한다 (동작 줄이기면 효과 없음)
 */
const rise = 'motion-safe:animate-rise-in'
const delay = (n: number): CSSProperties => ({
  animationDelay: `calc(var(--duration-stagger) * ${n})`,
})

/** ① 랜딩 — 로고, 제목, 시작 버튼, 오른쪽 전국 지도 그림 (1.Home) */
export default function LandingPage() {
  usePageTitle(MESSAGES.titles.landing)
  return (
    <div className="flex min-h-full flex-col bg-gray-0">
      <SkipLink />
      <main id={MAIN_ID} tabIndex={-1} className="flex-1 focus:outline-none">
        {/* 첫 화면(1440×900) — 제목·버튼·전국 지도는 그대로, 아래에 소개 섹션이 이어진다 */}
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-gray-0">
          <LandingMap />

          <header className="relative mx-auto w-full max-w-[1200px] px-10 pt-10">
            <Logo />
          </header>

          <div className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-10 pt-16">
            <div className={rise} style={delay(0)}>
              <h1 className="text-[2.5rem] leading-tight font-bold text-gray-900">
                {T.titleLine1}
                <br />
                {T.titleLine2}
              </h1>
              {/* 팀 슬로건 — 제목 위 작은 라벨이 아니라 제목을 받쳐 주는 보조 문장으로 */}
              <p className="mt-4 text-subtitle font-medium text-gray-900">{T.slogan}</p>
            </div>
            <p className={`mt-1 text-subtitle text-gray-600 ${rise}`} style={delay(1)}>
              {T.description}
            </p>
            <div className={`mt-8 ${rise}`} style={delay(2)}>
              <Link
                to={ROUTES.input}
                className="group inline-flex h-12 interactive-lift items-center gap-2 rounded-full bg-blue-600 px-7 text-subtitle font-semibold text-white shadow-card hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                {T.start}
                <ArrowRight className="size-5 arrow-nudge" aria-hidden="true" />
              </Link>
            </div>
            <p className={`mt-6 text-caption text-gray-600 ${rise}`} style={delay(2)}>
              {T.scope}
            </p>
          </div>

          {/* 아래에 소개가 더 있다는 작은 힌트 (이용 대상·면책 문구는 하단 SiteFooter로 옮김) */}
          <div className="relative mx-auto w-full max-w-[1200px] px-10 pt-10 pb-8">
            <a
              href="#landing-features-title"
              className="group inline-flex items-center gap-1 rounded text-caption text-gray-600 motion-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              {MESSAGES.landingIntro.scrollHint}
              <ChevronDown className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <LandingSections />
      </main>
      <SiteFooter />
    </div>
  )
}

/** 오른쪽 전국 지도 그림 + 뒤 배경 그라데이션. 이미지가 없으면 연한 파란 원형 그라데이션 임시 배경 */
function LandingMap() {
  if (IMAGES.landingMap) {
    // 글자 영역(왼쪽)을 가리지 않도록 오른쪽 아래에만 둔다. 장식이라 alt="" + aria-hidden
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-[16%] right-[3%] w-[52%] max-w-[820px] ${rise}`}
        style={delay(3)}
      >
        {IMAGES.landingGradient && (
          <img
            src={IMAGES.landingGradient}
            alt=""
            aria-hidden="true"
            className="absolute top-[18%] left-1/2 w-[118%] max-w-none -translate-x-1/2"
          />
        )}
        <img
          src={IMAGES.landingMap}
          alt=""
          aria-hidden="true"
          // 처음 등장 후 아주 느리게 한 번만 위아래로 왕복하고 멈춤 (진폭 8px, 4초, 동작 줄이기면 안 움직임)
          className="relative w-full object-contain motion-safe:animate-float"
        />
      </div>
    )
  }
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-[18%] -right-[8%] aspect-[4/3] w-[62%] rounded-full bg-radial from-blue-500/20 via-blue-100/70 to-transparent"
    />
  )
}
