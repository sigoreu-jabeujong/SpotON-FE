import { ExternalLink } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { PROJECT_LINKS } from '../../constants/links'
import { MESSAGES } from '../../constants/messages'
import { ROUTES } from '../../constants/routes'
import { SERVICE_SOURCE_IDS, SOURCES } from '../../constants/sources'
import Logo from '../common/Logo'

const T = MESSAGES.siteFooter

/** 랜딩 아래 소개 첫 제목 — 랜딩에서는 같은 화면 안 이동, 다른 화면에서는 랜딩으로 가서 이동 */
const FEATURES_HASH = '#landing-features-title'

const linkClass =
  'inline-flex items-center gap-1 rounded text-caption text-gray-600 motion-colors hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 max-md:min-h-11'

/**
 * 랜딩·입력 화면 공통 하단 — 위: 브랜드 + 링크 칸(서비스·프로젝트) / 가운데: 데이터 출처(글자만) / 맨 아래: 저작권 + 이용 안내 띠.
 * 기관 로고·엠블럼은 쓰지 않는다 (공식 서비스처럼 보이지 않게). 결과 화면은 ResultFooter를 쓴다.
 */
export default function SiteFooter() {
  const { pathname, hash } = useLocation()
  // 다른 화면에서 "서비스 소개"로 랜딩에 오면 (/#landing-features-title) 그 제목으로 내려 준다 —
  // 화면을 그리기 전이라 브라우저 기본 이동이 안 되므로, 랜딩에도 함께 있는 이 푸터에서 한 번 맞춘다
  useEffect(() => {
    if (pathname !== ROUTES.landing || hash !== FEATURES_HASH) return
    const frame = requestAnimationFrame(() =>
      document.getElementById(FEATURES_HASH.slice(1))?.scrollIntoView({ block: 'start' }),
    )
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])
  const aboutHref =
    pathname === ROUTES.landing ? FEATURES_HASH : `${ROUTES.landing}${FEATURES_HASH}`
  return (
    <footer className="border-t border-gray-300 bg-bg">
      <div className="mx-auto w-full max-w-[1200px] px-10 max-md:px-4">
        {/* 위: 브랜드 (왼쪽) + 링크 칸 2개 (오른쪽). 휴대폰은 한 단으로 쌓고 링크 칸은 2열 그대로 */}
        <div className="flex justify-between gap-10 py-12 max-md:flex-col max-md:gap-8 max-md:py-10">
          <div className="flex flex-col gap-2">
            <Logo />
            <p className="mt-1 text-caption text-gray-900">{MESSAGES.landing.slogan}</p>
            <p className="text-caption text-gray-600">{T.tagline}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-8 max-md:gap-x-6">
            <LinkColumn id="footer-service" title={T.serviceTitle}>
              <li>
                <Link to={ROUTES.input} className={linkClass}>
                  {MESSAGES.landing.start}
                </Link>
              </li>
              <li>
                <a href={aboutHref} className={linkClass}>
                  {T.about}
                </a>
              </li>
            </LinkColumn>
            <LinkColumn id="footer-project" title={T.linksTitle}>
              <li>
                <ExternalLinkItem href={PROJECT_LINKS.repository}>{T.repository}</ExternalLinkItem>
              </li>
              <li>
                <ExternalLinkItem href={PROJECT_LINKS.backendRepository}>
                  {T.backendRepository}
                </ExternalLinkItem>
              </li>
            </LinkColumn>
          </div>
        </div>

        {/* 가운데: 데이터 출처 — 문단이 아니라 라벨 + 이름 목록 한두 줄 */}
        <section
          aria-labelledby="footer-data"
          className="flex gap-4 border-y border-gray-300 py-5 max-md:flex-col max-md:gap-1.5"
        >
          <h2 id="footer-data" className="shrink-0 text-micro font-bold text-gray-900">
            {T.dataTitle}
          </h2>
          <p className="text-micro leading-relaxed break-keep text-gray-600">
            {SERVICE_SOURCE_IDS.map((id) => SOURCES[id].name).join(' · ')}
          </p>
        </section>

        {/* 맨 아래 띠: 저작권 (왼쪽) + 이용 안내 세 가지 (오른쪽, 공공서비스 필수 안내라 문장 그대로) */}
        <div className="flex justify-between gap-10 py-6 max-md:flex-col max-md:gap-4">
          <p className="shrink-0 text-micro text-gray-600">
            {T.copyright} {T.team}
          </p>
          <section aria-labelledby="footer-usage" className="max-w-[640px]">
            <h2 id="footer-usage" className="sr-only">
              {T.usageTitle}
            </h2>
            <ul className="space-y-1 text-right text-micro leading-relaxed break-keep text-gray-600 max-md:text-left">
              <li>{MESSAGES.layout.ageNotice}</li>
              <li>{MESSAGES.disclaimer}</li>
              <li>{T.privacy}</li>
            </ul>
          </section>
        </div>
      </div>
    </footer>
  )
}

function LinkColumn({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-caption font-bold text-gray-900">
        {title}
      </h2>
      <ul className="mt-3 space-y-2 max-md:mt-1 max-md:space-y-0">{children}</ul>
    </section>
  )
}

/** 외부 링크 — 새 창 + 화면 읽기용 "(새 창)" + ↗ 아이콘 */
function ExternalLinkItem({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`group ${linkClass}`}>
      {children}
      <span className="sr-only">{T.newWindow}</span>
      <ExternalLink className="size-3.5 arrow-nudge" aria-hidden="true" />
    </a>
  )
}
