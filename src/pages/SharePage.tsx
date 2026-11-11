import { FileDown, Handshake, Headset, ImageDown, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import Card from '../components/common/Card'
import Reveal from '../components/common/Reveal'
import RediagnoseBanner from '../components/share/RediagnoseBanner'
import SummaryImageCard from '../components/share/SummaryImageCard'
import SupportLinksSection from '../components/share/SupportLinksSection'
import { useSummaryImage } from '../components/share/useSummaryImage'
import { MESSAGES } from '../constants/messages'
import { scrollBehavior } from '../constants/motion'
import { ROUTES } from '../constants/routes'
import { useDiagnosisQuery } from '../hooks/useDiagnosisQuery'
import { useReportData } from '../hooks/useReportData'
import { cn } from '../utils/cn'

const T = MESSAGES.share

type CardTone = 'pink' | 'green' | 'orange' | 'purple'
const TONE: Record<CardTone, { bg: string; icon: string }> = {
  pink: { bg: 'bg-pink-100', icon: 'text-pink-700' },
  green: { bg: 'bg-green-100', icon: 'text-green-700' },
  orange: { bg: 'bg-orange-100', icon: 'text-orange-700' },
  purple: { bg: 'bg-purple-100', icon: 'text-purple-700' },
}

/** STEP 04 결과 저장 및 상담 (F-09·F-10) — 디자인 07 B안(색깔 카드) */
export default function SharePage() {
  const navigate = useNavigate()
  const { search } = useDiagnosisQuery()
  // 진단서·요약 이미지에 쓰는 데이터 (결과 화면과 같은 캐시, 없으면 불러옴)
  const report = useReportData()
  const { cardRef, status: imageStatus, save: saveImage } = useSummaryImage(T.imageFileName)
  const imageReady = !report.loading && !!report.risk.data && !!report.activity.data

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })

  return (
    <Card className="flex flex-col gap-10">
      <div className="grid grid-cols-4 gap-4">
        <ActionCard
          tone="pink"
          icon={FileDown}
          title={T.cards.pdf.title}
          desc={T.cards.pdf.desc}
          onClick={() => navigate({ pathname: ROUTES.report, search })}
        />
        <ActionCard
          tone="green"
          icon={ImageDown}
          title={T.cards.image.title}
          desc={imageStatus === 'making' ? T.imageMaking : T.cards.image.desc}
          disabled={imageStatus === 'making'}
          onClick={() => void saveImage()}
        />
        <ActionCard
          tone="orange"
          icon={Headset}
          title={T.cards.consulting.title}
          desc={T.cards.consulting.desc}
          onClick={() => scrollTo('links-consulting')}
        />
        <ActionCard
          tone="purple"
          icon={Handshake}
          title={T.cards.support.title}
          desc={T.cards.support.desc}
          onClick={() => scrollTo('links-support')}
        />
      </div>

      <p aria-live="polite" className="-mt-6 text-center text-caption font-semibold">
        {imageStatus === 'done' && <span className="text-blue-700">{T.imageDone}</span>}
        {imageStatus === 'failed' && (
          <span className="text-danger">{imageReady ? T.imageFailed : T.imageNeedsData}</span>
        )}
      </p>

      <Reveal>
        <SupportLinksSection />
      </Reveal>

      <Reveal>
        <RediagnoseBanner />
      </Reveal>

      {/* 요약 이미지용 카드 — 화면 밖에 그려 두고 html2canvas가 읽는다 */}
      {imageReady && (
        <div aria-hidden="true" className="pointer-events-none fixed top-0 -left-[20000px]">
          <SummaryImageCard ref={cardRef} data={report} />
        </div>
      )}
    </Card>
  )
}

export function ActionCard({
  tone,
  icon: Icon,
  title,
  desc,
  onClick,
  disabled,
}: {
  tone: CardTone
  icon: LucideIcon
  title: string
  desc: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex interactive-lift flex-col items-center gap-3 rounded-card px-4 py-7 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-wait disabled:opacity-70',
        TONE[tone].bg,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-gray-0 shadow-card">
        <Icon className={cn('size-7', TONE[tone].icon)} aria-hidden="true" />
      </span>
      <span className="text-body font-bold break-keep text-gray-900">{title}</span>
      <span className="text-micro break-keep text-gray-600">{desc}</span>
    </button>
  )
}
