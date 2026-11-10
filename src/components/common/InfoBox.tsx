import { Info } from 'lucide-react'

type Props = {
  /** 화면 읽기 프로그램용 제목 (화면에는 숨김) */
  title: string
  items: readonly string[]
}

/** 회색 안내 박스: 아이콘 + 여러 줄 안내 (예: 이력 표 아래 유의사항) */
export default function InfoBox({ title, items }: Props) {
  return (
    <aside
      aria-label={title}
      className="flex gap-3 rounded-control bg-gray-100 px-4 py-3 text-caption text-gray-600"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-blue-500" aria-hidden="true" />
      <ul className="list-disc space-y-0.5 pl-4 marker:text-gray-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  )
}
