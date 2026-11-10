import { MESSAGES } from '../../../constants/messages'

type Props = { error: unknown; verifyFailed: boolean; onRetry: () => void }

/** AI 해석 실패 안내 (다음 커밋에서 오류별 문구와 다시 시도를 채운다) */
export default function AiFailure({ onRetry }: Props) {
  return (
    <div role="alert" className="rounded-card bg-gray-100 px-6 py-5 text-body text-gray-900">
      {MESSAGES.ai.unavailable}
      <button type="button" onClick={onRetry} className="ml-2 underline">
        {MESSAGES.ai.retry}
      </button>
    </div>
  )
}
