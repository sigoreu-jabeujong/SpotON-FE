import { Info } from 'lucide-react'
import { MESSAGES } from '../../constants/messages'

type Props = {
  /** "데이터 기준일 YYYY.MM.DD (수집 YYYY.MM.DD)" — formatDataBaseline 결과. 없으면 안내 문구 */
  baseline?: string | null
}

/** 결과 화면 공통 하단: 면책 문구 + 이용 대상 안내 + 데이터 기준일 */
export default function ResultFooter({ baseline }: Props) {
  return (
    <footer className="border-t border-gray-300 px-10 py-6 text-caption text-gray-600">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div className="space-y-1">
          <p>{MESSAGES.disclaimer}</p>
          <p>{MESSAGES.layout.ageNotice}</p>
          <p>{baseline ?? MESSAGES.layout.baselinePending}</p>
        </div>
      </div>
    </footer>
  )
}
