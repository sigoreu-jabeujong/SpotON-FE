import { LoaderCircle } from 'lucide-react'
import { MESSAGES } from '../../constants/messages'

type Props = { message?: string }

/** 불러오는 중 표시 (화면 읽기 프로그램에도 알림) */
export default function LoadingState({ message = MESSAGES.common.loading }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="text-caption flex flex-col items-center justify-center gap-2 py-10 text-gray-600"
    >
      <LoaderCircle className="size-6 animate-spin text-blue-500" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
