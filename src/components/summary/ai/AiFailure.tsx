import { BotOff, RotateCw } from 'lucide-react'
import { MESSAGES } from '../../../constants/messages'
import Button from '../../common/Button'

const T = MESSAGES.ai

type Props = {
  /** 요청 오류 (AI_UNAVAILABLE·AI_VERIFY_FAILED·TIMEOUT·NETWORK_ERROR·INVALID_PARAM 등) */
  error: unknown
  /** 200이지만 verification.passed가 false — 문장을 보여주지 않고 실패로 처리 */
  verifyFailed: boolean
  onRetry: () => void
}

const codeOf = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
    ? error.code
    : null

/**
 * AI 해석 실패 안내 — 위쪽 지표 카드는 그대로 두고 이 자리만 바꾼다.
 * INVALID_PARAM(서버 재계산 값과 불일치)이면 부모가 지표를 다시 불러오고, 여기서는 다시 시도를 안내한다.
 */
export default function AiFailure({ error, verifyFailed, onRetry }: Props) {
  const invalid = codeOf(error) === 'INVALID_PARAM'
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-gray-300 bg-gray-100 px-6 py-5"
    >
      <div className="flex items-start gap-3">
        <BotOff className="mt-0.5 size-6 shrink-0 text-gray-600" aria-hidden="true" />
        <div>
          <p className="text-body font-semibold text-gray-900">{T.unavailable}</p>
          {invalid && <p className="mt-0.5 text-caption text-gray-600">{T.reloadedIndicators}</p>}
          {verifyFailed && <p className="mt-0.5 text-caption text-gray-600">{T.verifyFailed}</p>}
        </div>
      </div>
      <Button variant="secondary" onClick={onRetry} iconRight={<RotateCw className="size-4" />}>
        {T.retry}
      </Button>
    </div>
  )
}
