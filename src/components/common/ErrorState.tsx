import { CircleAlert, RotateCw, SlidersHorizontal } from 'lucide-react'
import { getErrorMessageFrom, MESSAGES } from '../../constants/messages'
import Button from './Button'
import StatePanel from './StatePanel'

type Props = {
  /** 잡힌 오류 (ApiRequestError 등) — 코드에 맞는 안내 문구를 설명으로 쓴다 */
  error?: unknown
  /** 직접 주는 설명 (error보다 우선, 예: 선택할 수 있는 기간 안내) */
  message?: string
  /** 제목 (기본: "정보를 불러오지 못했어요") */
  title?: string
  onRetry?: () => void
  /** 다시 시도해도 같은 오류(예: 범위 밖 시점)일 때 — 같은 화면의 조회 조건으로 옮겨 준다 */
  onEditConditions?: () => void
}

/** 오류 안내 — 아이콘 + 제목 + 설명(무엇이 안 됐고 어떻게 하면 되는지) + 다시 시도/조건 바꾸기 */
export default function ErrorState({ error, message, title, onRetry, onEditConditions }: Props) {
  const raw = message ?? (error ? getErrorMessageFrom(error) : null)
  // 공통 문구("정보를 불러오지 못했어요. 잠시 후…")는 제목과 겹치지 않게 설명만 남긴다
  const description = !raw || raw === MESSAGES.common.error ? MESSAGES.common.errorHint : raw
  return (
    <StatePanel
      role="alert"
      icon={CircleAlert}
      tone="error"
      title={title ?? MESSAGES.common.errorTitle}
      description={description}
      actions={
        (onRetry || onEditConditions) && (
          <>
            {onRetry && (
              <Button
                variant="secondary"
                onClick={onRetry}
                iconRight={<RotateCw className="size-4" />}
              >
                {MESSAGES.common.retry}
              </Button>
            )}
            {onEditConditions && (
              <Button
                variant="secondary"
                onClick={onEditConditions}
                iconRight={<SlidersHorizontal className="size-4" />}
              >
                {MESSAGES.common.editConditions}
              </Button>
            )}
          </>
        )
      }
    />
  )
}
