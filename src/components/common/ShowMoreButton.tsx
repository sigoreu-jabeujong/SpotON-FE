import { ChevronDown } from 'lucide-react'
import { MESSAGES } from '../../constants/messages'

type Props = {
  /** 지금 보이는 개수 */
  shown: number
  /** 전체 개수 */
  total: number
  onClick: () => void
  /** 늘어나는 목록(표 등)의 id — 화면 읽기 프로그램에 연결 */
  controls?: string
}

/** 목록 아래 넓은 "더보기" 버튼. 다 보이면 부모가 렌더하지 않는다 (useShowMore.hasMore) */
export default function ShowMoreButton({ shown, total, onClick, controls }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-controls={controls}
      className="mt-2 flex h-10 w-full items-center justify-center gap-1 rounded-control border border-gray-300 bg-gray-0 text-caption font-semibold text-gray-900 motion-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
    >
      {MESSAGES.list.showMore}
      <span className="font-normal text-gray-600">
        ({shown}/{total})
      </span>
      <ChevronDown className="size-4" aria-hidden="true" />
    </button>
  )
}
