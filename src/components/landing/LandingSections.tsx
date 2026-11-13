import {
  ArrowRight,
  Bot,
  ClipboardCheck,
  Database,
  History,
  Info,
  MapPin,
  Scale,
  Search,
  Store,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { MESSAGES } from '../../constants/messages'
import { ROUTES } from '../../constants/routes'
import { SERVICE_SOURCE_IDS, SOURCES } from '../../constants/sources'
import Reveal from '../common/Reveal'

const T = MESSAGES.landingIntro

/** 차별점 카드 아이콘 (순서는 messages.ts landingIntro.features와 같다) */
const FEATURE_ICONS: LucideIcon[] = [Store, History, Scale, Bot]
/** 이용 단계 아이콘 */
const STEP_ICONS: LucideIcon[] = [MapPin, Search, ClipboardCheck]

/**
 * 랜딩 첫 화면 아래 소개 — ① 확인할 수 있는 것 ② 이용 방법 ③ 사용하는 데이터 ④ 진단 시작.
 * 홍보용 수치·목업 화면 캡처·기관 로고는 쓰지 않는다 (아이콘과 글자만).
 */
export default function LandingSections() {
  return (
    <div className="bg-bg">
      <Section id="landing-features" title={T.featuresTitle}>
        <ul className="grid grid-cols-4 gap-4">
          {T.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i]
            return (
              // 누를 수 없는 소개 카드 — hover 시 떠오름·그림자·옅은 파랑 테두리(outline이라 크기 변화 없음)
              <li
                key={f.title}
                className="group flex hover-card flex-col gap-3 rounded-card bg-gray-0 p-6 shadow-card outline outline-1 outline-transparent hover:outline-blue-500/25"
              >
                {/* 아이콘 동그라미: 연파랑 → 파랑(blue-600, 흰 아이콘 대비 4.74:1) + 한 번 살짝 커짐 */}
                <span className="flex size-12 icon-pop items-center justify-center rounded-full bg-blue-100 text-blue-500 motion-colors group-hover:bg-blue-600 group-hover:text-white">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="text-subtitle font-bold break-keep text-gray-900">{f.title}</h3>
                <p className="text-body break-keep text-gray-600">{f.description}</p>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section id="landing-steps" title={T.stepsTitle}>
        <ol className="grid grid-cols-3 gap-4">
          {T.steps.map((s, i) => {
            const Icon = STEP_ICONS[i]
            return (
              <li
                key={s.title}
                className="group relative flex hover-card flex-col gap-3 rounded-card border border-gray-300 bg-gray-0 p-6 hover:border-blue-500/30"
              >
                <span className="flex items-center gap-2">
                  {/* 단계 아이콘은 원래 파랑 바탕 — hover 시 한 번 살짝 커짐만 */}
                  <span className="flex size-10 icon-pop items-center justify-center rounded-full bg-blue-600 text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-caption font-semibold text-blue-700">
                    {T.stepLabel(i + 1)}
                  </span>
                </span>
                <h3 className="text-subtitle font-bold text-gray-900">{s.title}</h3>
                <p className="text-body break-keep text-gray-600">{s.description}</p>
                {i < T.steps.length - 1 && (
                  // 단계 사이 화살표 — 카드에 마우스를 올리면 오른쪽으로 살짝 (arrow-nudge)
                  <ArrowRight
                    className="absolute top-1/2 -right-[14px] z-10 size-5 -translate-y-1/2 arrow-nudge rounded-full bg-bg text-gray-600"
                    aria-hidden="true"
                  />
                )}
              </li>
            )
          })}
        </ol>
      </Section>

      <Section id="landing-data" title={T.dataTitle} description={T.dataDescription}>
        <ul className="flex flex-wrap gap-2">
          {SERVICE_SOURCE_IDS.map((id) => (
            <li
              key={id}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-0 px-4 py-2 text-caption text-gray-900"
            >
              <Database className="size-3.5 text-blue-500" aria-hidden="true" />
              {SOURCES[id].name}
            </li>
          ))}
        </ul>
        <p className="mt-5 flex items-center gap-2 text-caption text-gray-600">
          <Info className="size-4 shrink-0 text-blue-500" aria-hidden="true" />
          {T.dataNotice}
        </p>
      </Section>

      <Reveal className="mx-auto w-full max-w-[1200px] px-10 pt-6 pb-24">
        <section
          aria-labelledby="landing-cta-title"
          className="flex items-center justify-between gap-8 rounded-card bg-blue-100 px-10 py-10"
        >
          <div>
            <h2 id="landing-cta-title" className="text-section font-bold text-gray-900">
              {T.ctaTitle}
            </h2>
            <p className="mt-1 text-body text-gray-600">{T.ctaDescription}</p>
          </div>
          <Link
            to={ROUTES.input}
            className="group inline-flex h-12 shrink-0 interactive-lift items-center gap-2 rounded-full bg-blue-600 px-7 text-subtitle font-semibold text-white shadow-card hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            {/* 화살표는 화면의 주요 버튼(첫 화면 '진단 시작하기') 하나에만 */}
            {MESSAGES.landing.start}
          </Link>
        </section>
      </Reveal>
    </div>
  )
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Reveal className="mx-auto w-full max-w-[1200px] px-10 py-14">
      <section aria-labelledby={`${id}-title`}>
        <h2 id={`${id}-title`} className="scroll-mt-8 text-section font-bold text-gray-900">
          {title}
        </h2>
        {description && <p className="mt-1 text-body text-gray-600">{description}</p>}
        <div className="mt-6">{children}</div>
      </section>
    </Reveal>
  )
}
