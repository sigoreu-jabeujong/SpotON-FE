import { ChartNoAxesColumn, ClipboardList, Map as MapIcon, type LucideIcon } from 'lucide-react'
import { MESSAGES } from '../../constants/messages'

const T = MESSAGES.input
const FEATURE_ICONS: LucideIcon[] = [ChartNoAxesColumn, MapIcon, ClipboardList]

/** 입력 화면 왼쪽 소개: DATA-BASED INSIGHT, 제목, 설명, 특징 3개 */
export default function InputIntro() {
  return (
    <div className="max-w-[420px]">
      <p className="text-micro font-semibold tracking-wider text-blue-700">{T.eyebrow}</p>
      <h1 className="mt-3 text-[2.25rem] leading-tight font-bold text-gray-900">
        {T.introTitleLine1}
        <br />
        {T.introTitleLine2}
      </h1>
      <p className="mt-5 text-body break-keep text-gray-600">{T.introDescription}</p>
      <ul className="mt-8 flex flex-col gap-4">
        {T.features.map((feature, i) => {
          const Icon = FEATURE_ICONS[i]
          return (
            <li key={feature} className="flex items-center gap-2.5 text-body text-gray-900">
              <Icon className="size-5 text-gray-900" aria-hidden="true" />
              {feature}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
