import { MESSAGES } from '../../constants/messages'
import HeaderArt from './HeaderArt'

type Props = { title: string; description: string }

/** 결과 화면 공통 머리: "DATA - BASED INSIGHT" + 화면 제목·설명 + 오른쪽 배경 그림 */
export default function ResultHeader({ title, description }: Props) {
  return (
    <header className="relative overflow-hidden px-10 pt-10 pb-8">
      <HeaderArt />
      <div className="relative">
        <p className="text-micro font-semibold tracking-wide text-blue-500">
          {MESSAGES.layout.eyebrow}
        </p>
        <h1 className="mt-1 text-title font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-body text-gray-600">{description}</p>
      </div>
    </header>
  )
}
