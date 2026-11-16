import { ChevronRight, FileDown, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import Card from '../components/common/Card'
import RediagnoseBanner from '../components/share/RediagnoseBanner'
import SupportLinksSection from '../components/share/SupportLinksSection'
import { MESSAGES } from '../constants/messages'
import { ROUTES } from '../constants/routes'
import { useDiagnosisQuery } from '../hooks/useDiagnosisQuery'

const T = MESSAGES.share

/**
 * STEP 04 결과 저장 및 상담 (F-09·F-10) — 위에는 "PDF 진단서 저장" 카드 하나(가로로 넓게),
 * 아래는 상담센터·지원사업 목록과 다시 진단 안내
 */
export default function SharePage() {
  const navigate = useNavigate()
  const { search } = useDiagnosisQuery()

  return (
    <Card className="flex flex-col gap-10">
      <ActionCard
        icon={FileDown}
        title={T.cards.pdf.title}
        desc={T.cards.pdf.desc}
        onClick={() => navigate({ pathname: ROUTES.report, search })}
      />
      <SupportLinksSection />
      <RediagnoseBanner />
    </Card>
  )
}

/** 가로로 넓은 흰 카드 버튼 — 파란 아이콘 + 제목·설명 + 오른쪽 화살표 (누르면 테두리·그림자·색만 바뀐다) */
function ActionCard({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: LucideIcon
  title: string
  desc: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-card border border-gray-300 bg-gray-0 px-6 py-5 text-left motion-colors hover:border-blue-500/50 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 max-sm:px-4"
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-100 motion-colors group-hover:bg-blue-500/15">
        <Icon className="size-7 text-blue-700" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-subtitle font-bold break-keep text-gray-900">{title}</span>
        <span className="text-caption break-keep text-gray-600">{desc}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 arrow-nudge text-blue-700" aria-hidden="true" />
    </button>
  )
}
