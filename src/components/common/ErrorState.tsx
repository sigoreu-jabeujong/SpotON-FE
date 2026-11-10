import { CircleAlert, RotateCw } from 'lucide-react'
import { getErrorMessageFrom, MESSAGES } from '../../constants/messages'
import Button from './Button'

type Props = {
  /** 잡힌 오류 (ApiRequestError 등) — 코드에 맞는 안내 문구를 찾는다 */
  error?: unknown
  /** 직접 문구를 줄 때 (error보다 우선) */
  message?: string
  onRetry?: () => void
}

/** 오류 안내 + 다시 시도 버튼 */
export default function ErrorState({ error, message, onRetry }: Props) {
  const text = message ?? (error ? getErrorMessageFrom(error) : MESSAGES.common.error)
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <CircleAlert className="size-7 text-danger" aria-hidden="true" />
      <p className="text-body text-gray-900">{text}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} iconRight={<RotateCw className="size-4" />}>
          {MESSAGES.common.retry}
        </Button>
      )}
    </div>
  )
}
