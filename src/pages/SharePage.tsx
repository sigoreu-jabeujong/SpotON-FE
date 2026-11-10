import { FileDown, Handshake, Headset, ImageDown, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import Card from '../components/common/Card'
import { MESSAGES } from '../constants/messages'
import { ROUTES } from '../constants/routes'
import { useDiagnosisQuery } from '../hooks/useDiagnosisQuery'
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

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

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
          desc={T.cards.image.desc}
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
        'flex flex-col items-center gap-3 rounded-card px-4 py-7 text-center transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-wait disabled:opacity-70',
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
