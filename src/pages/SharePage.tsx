import { FileDown, Handshake, Headset, ImageDown, type LucideIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import Card from '../components/common/Card'
import RediagnoseBanner from '../components/share/RediagnoseBanner'
import SummaryImageCard from '../components/share/SummaryImageCard'
import SupportLinksSection from '../components/share/SupportLinksSection'
import { useSummaryImage } from '../components/share/useSummaryImage'
import { MESSAGES } from '../constants/messages'
import { scrollBehavior } from '../constants/motion'
import { ROUTES } from '../constants/routes'
import { useToast } from '../hooks/useToast'
import { imageSaveToast } from '../utils/toast'
import { useDiagnosisQuery } from '../hooks/useDiagnosisQuery'
import { useReportData } from '../hooks/useReportData'

const T = MESSAGES.share

/** STEP 04 결과 저장 및 상담 (F-09·F-10) — 디자인 07 B안의 카드 4장을 흰 카드 + 파란 아이콘으로 통일 */
export default function SharePage() {
  const navigate = useNavigate()
  const { search } = useDiagnosisQuery()
  // 진단서·요약 이미지에 쓰는 데이터 (결과 화면과 같은 캐시, 없으면 불러옴)
  const report = useReportData()
  const { cardRef, status: imageStatus, save: saveImage } = useSummaryImage(T.imageFileName)
  const imageReady = !report.loading && !!report.risk.data && !!report.activity.data
  const toast = useToast()
  // 저장 결과(완료·실패)가 바뀌는 순간에만 화면 아래 알림 — 저장 동작·결과물은 그대로
  const lastImageStatus = useRef(imageStatus)
  useEffect(() => {
    if (lastImageStatus.current === imageStatus) return
    lastImageStatus.current = imageStatus
    const next = imageSaveToast(imageStatus, imageReady)
    if (next) toast(next)
  }, [imageStatus, imageReady, toast])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })

  return (
    <Card className="flex flex-col gap-10">
      <div className="grid grid-cols-4 gap-4">
        <ActionCard
          icon={FileDown}
          title={T.cards.pdf.title}
          desc={T.cards.pdf.desc}
          onClick={() => navigate({ pathname: ROUTES.report, search })}
        />
        <ActionCard
          icon={ImageDown}
          title={T.cards.image.title}
          desc={imageStatus === 'making' ? T.imageMaking : T.cards.image.desc}
          disabled={imageStatus === 'making'}
          onClick={() => void saveImage()}
        />
        <ActionCard
          icon={Headset}
          title={T.cards.consulting.title}
          desc={T.cards.consulting.desc}
          onClick={() => scrollTo('links-consulting')}
        />
        <ActionCard
          icon={Handshake}
          title={T.cards.support.title}
          desc={T.cards.support.desc}
          onClick={() => scrollTo('links-support')}
        />
      </div>

      {/* 화면 글자는 그대로 두고 화면 읽기 알림은 아래 토스트 하나로 (두 번 읽지 않게) */}
      <p className="-mt-6 text-center text-caption font-semibold">
        {imageStatus === 'done' && <span className="text-blue-700">{T.imageDone}</span>}
        {imageStatus === 'failed' && (
          <span className="text-danger">{imageReady ? T.imageFailed : T.imageNeedsData}</span>
        )}
      </p>
      <SupportLinksSection />
      <RediagnoseBanner />

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
  icon: Icon,
  title,
  desc,
  onClick,
  disabled,
}: {
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
      // 흰 카드 + 파란 아이콘 하나 — 누르면 떠오르지 않고 테두리·그림자·색만 바뀐다
      className="group flex flex-col items-center gap-3 rounded-card border border-gray-300 bg-gray-0 px-4 py-7 text-center motion-colors hover:border-blue-500/50 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-wait disabled:opacity-70"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-blue-100 motion-colors group-hover:bg-blue-500/15">
        <Icon className="size-7 text-blue-700" aria-hidden="true" />
      </span>
      <span className="text-body font-bold break-keep text-gray-900">{title}</span>
      <span className="text-micro break-keep text-gray-600">{desc}</span>
    </button>
  )
}
