import { Inbox } from 'lucide-react'
import { MESSAGES } from '../../constants/messages'

type Props = { message?: string }

/** 빈 결과 안내 (서버 message가 있으면 그 문구를 넘긴다) */
export default function EmptyState({ message = MESSAGES.common.empty }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-body text-gray-600">
      <Inbox className="size-7 text-gray-300" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}
