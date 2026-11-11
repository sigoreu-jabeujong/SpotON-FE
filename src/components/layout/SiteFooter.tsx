import { ExternalLink } from 'lucide-react'
import { PROJECT_LINKS } from '../../constants/links'
import { MESSAGES } from '../../constants/messages'
import { SERVICE_SOURCE_IDS, SOURCES } from '../../constants/sources'
import Logo from '../common/Logo'

const T = MESSAGES.siteFooter

/**
 * 랜딩·입력 화면 공통 하단 — 서비스명·슬로건·팀, 이용 안내, 데이터 출처(글자만), 저장소 링크.
 * 기관 로고·엠블럼은 쓰지 않는다 (공식 서비스처럼 보이지 않게). 결과 화면은 ResultFooter를 쓴다.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-300 bg-gray-0">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-12 gap-10 px-10 py-12 text-caption text-gray-600">
        <div className="col-span-4 flex flex-col gap-3">
          <Logo />
          <p className="text-gray-900">{MESSAGES.landing.slogan}</p>
          <p>{T.team}</p>
        </div>

        <section aria-labelledby="footer-usage" className="col-span-4">
          <h2 id="footer-usage" className="text-body font-bold text-gray-900">
            {T.usageTitle}
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-4 break-keep marker:text-gray-300">
            <li>{MESSAGES.layout.ageNotice}</li>
            <li>{MESSAGES.disclaimer}</li>
            <li>{T.privacy}</li>
          </ul>
        </section>

        <section aria-labelledby="footer-data" className="col-span-4 flex flex-col gap-6">
          <div>
            <h2 id="footer-data" className="text-body font-bold text-gray-900">
              {T.dataTitle}
            </h2>
            <p className="mt-3 break-keep">
              {SERVICE_SOURCE_IDS.map((id) => SOURCES[id].name).join(' · ')}
            </p>
          </div>
          <div>
            <h2 className="text-body font-bold text-gray-900">{T.linksTitle}</h2>
            <a
              href={PROJECT_LINKS.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-3 inline-flex items-center gap-1 rounded font-semibold text-blue-700 motion-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              {T.repository}
              <span className="sr-only">{T.newWindow}</span>
              <ExternalLink className="size-3.5 arrow-nudge" aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </footer>
  )
}
