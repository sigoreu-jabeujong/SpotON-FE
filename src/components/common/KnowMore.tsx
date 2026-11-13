import { ChevronDown, Info } from 'lucide-react'
import { MESSAGES } from '../../constants/messages'

type Props = {
  /** 펼치면 보이는 안내 줄 (문구 그대로) */
  items: readonly string[]
  /** 접힌 제목 (기본 "알아두세요") */
  title?: string
}

/** 접는 안내 상자 — 꼭 필요할 때 펼쳐 보는 유의사항 (닫혀 있어도 제목은 보인다) */
export default function KnowMore({ items, title = MESSAGES.frame.knowMore }: Props) {
  if (items.length === 0) return null
  return (
    <details className="group rounded-control bg-gray-100 text-caption text-gray-600">
      <summary className="flex cursor-pointer list-none items-center gap-stack-1 rounded-control px-stack-2 py-stack-1 font-semibold text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 [&::-webkit-details-marker]:hidden">
        <Info className="size-4 shrink-0 text-blue-500" aria-hidden="true" />
        {title}
        <ChevronDown
          className="ml-auto size-4 text-gray-600 motion-colors group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <ul className="max-w-4xl list-disc space-y-0.5 pr-stack-2 pb-stack-2 pl-10 leading-relaxed marker:text-gray-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </details>
  )
}
