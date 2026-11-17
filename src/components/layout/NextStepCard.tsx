import { ClipboardList, Download, type LucideIcon } from 'lucide-react'
import { MESSAGES } from '../../constants/messages'
import { ROUTES } from '../../constants/routes'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import BannerLink from '../common/BannerLink'

const STEPS: Record<
  'analysis' | 'summary',
  { to: string; icon: LucideIcon; text: { title: string; desc: string; label: string } }
> = {
  // 아이콘은 사이드바 단계 아이콘과 같게
  analysis: { to: ROUTES.summary, icon: ClipboardList, text: MESSAGES.layout.nextStep.analysis },
  summary: { to: ROUTES.share, icon: Download, text: MESSAGES.layout.nextStep.summary },
}

/**
 * STEP 02·03 본문 맨 아래 "다음 단계" 카드 — 휴대폰에서 끝까지 내린 뒤 위로 다시 올라가지 않고 다음 단계로.
 * 진단 조건(URL 쿼리)은 사이드바 단계 링크처럼 그대로 넘기고, 이동한 화면은 맨 위에서 시작한다.
 * 인쇄·진단서(PDF)에는 나오지 않는다
 */
export default function NextStepCard({ from }: { from: 'analysis' | 'summary' }) {
  const { search } = useDiagnosisQuery()
  const step = STEPS[from]
  const Icon = step.icon
  return (
    <BannerLink
      to={{ pathname: step.to, search }}
      label={step.text.label}
      art={
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-0 text-blue-500">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      }
      title={step.text.title}
      desc={step.text.desc}
      // 결과 화면은 창 전체가 스크롤된다 — 다음 단계는 맨 위에서 시작
      onClick={() => window.scrollTo({ top: 0 })}
      className="print:hidden"
    />
  )
}
