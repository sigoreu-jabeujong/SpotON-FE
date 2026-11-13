import { Inbox, SlidersHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'
import { MESSAGES } from '../../constants/messages'
import Button from './Button'
import StatePanel from './StatePanel'

type Props = {
  /** 제목 — 서버 message가 있으면 그 문구 (없으면 공통 문구) */
  message?: string
  /** 설명 한 줄 — 어떻게 하면 되는지 (기본: 조건을 바꿔 보라는 안내) */
  description?: string | null
  /** 같은 화면의 조회 조건으로 옮겨 주는 "조건 바꾸기" (있을 때만 버튼) */
  onEditConditions?: () => void
  /** 직접 넣는 다음 행동 (예: 입력 화면으로 가는 링크) */
  action?: ReactNode
}

/** 빈 결과 안내 — 아이콘 + 제목 + 설명 + 다음 행동 (StatePanel 공통 모양) */
export default function EmptyState({
  message = MESSAGES.common.empty,
  description = MESSAGES.common.emptyHint,
  onEditConditions,
  action,
}: Props) {
  return (
    <StatePanel
      icon={Inbox}
      tone="empty"
      title={message}
      description={description}
      actions={
        action ??
        (onEditConditions && (
          <Button
            variant="secondary"
            onClick={onEditConditions}
            iconRight={<SlidersHorizontal className="size-4" />}
          >
            {MESSAGES.common.editConditions}
          </Button>
        ))
      }
    />
  )
}
