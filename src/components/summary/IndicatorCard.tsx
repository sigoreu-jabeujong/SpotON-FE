import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { DataStatus } from '../../constants/labels'
import type { IndicatorId } from '../../types/risk'
import { cn } from '../../utils/cn'
import StatusLabel, { StatusIcon } from '../common/StatusLabel'
import { indicatorAnchorId } from './indicatorFormat'

type Props = {
  /** 지표 id — AI 해석 근거 칩에서 이 카드로 이동할 때 쓴다 */
  id: IndicatorId
  icon: LucideIcon
  /** 아이콘 색 (공식 파랑 / 참고 회색 — 영역 구분용, 등급 색 아님) */
  iconClassName: string
  title: string
  /** 형식 변환까지 끝난 서버 값. 없으면 값 자리에 상태 아이콘 + 사유 */
  value: string | null
  /** 값이 없을 때 값 자리에 쓸 상태와 문장 (사유 또는 안내) */
  empty: { status: DataStatus; text: string | null }
  /** 값 아래 작은 설명 (분자/분모, 기간, 상권, 서울 평균 등) */
  details?: ReactNode
  /** 링크·복사 버튼처럼 카드 안에서 할 수 있는 일 */
  actions?: ReactNode
  /** 카드 아래쪽 상태 라벨 */
  status: DataStatus
  /** 맨 아래 출처·기준 줄 */
  source: ReactNode
  className?: string
}

/**
 * 종합 진단 지표 카드 공통 틀 — 제목 / 값(고정 높이) / 설명 / 상태 라벨 / 출처를 모든 카드에서 같은 자리에 둔다.
 * 같은 줄 카드는 높이가 같고(그리드 stretch), 상태 라벨·출처는 아래에 붙어 줄이 맞는다.
 * "판단 보류·자료 없음"이면 0 대신 값 자리에 상태 아이콘과 사유를 보여준다.
 */
export default function IndicatorCard({
  id,
  icon: Icon,
  iconClassName,
  title,
  value,
  empty,
  details,
  actions,
  status,
  source,
  className,
}: Props) {
  return (
    <article
      id={indicatorAnchorId(id)}
      tabIndex={-1}
      className={cn(
        'flex h-full scroll-mt-sticky flex-col rounded-control border border-gray-300 bg-gray-0 p-5 focus:outline-2 focus:outline-blue-500',
        className,
      )}
    >
      <h3 className="flex items-center gap-1.5 text-body font-bold text-gray-900">
        <Icon className={cn('size-4 shrink-0', iconClassName)} aria-hidden="true" />
        {title}
      </h3>

      <div className="mt-3 flex min-h-12 items-center">
        {value ? (
          <p className="text-title leading-tight font-bold text-gray-900 tabular-nums">{value}</p>
        ) : (
          <p className="flex items-start gap-2 text-body font-semibold text-gray-600">
            <StatusIcon status={empty.status} className="mt-0.5 size-5 shrink-0" />
            <span>{empty.text}</span>
          </p>
        )}
      </div>

      {details && <div className="mt-2 text-caption text-gray-600">{details}</div>}
      {actions && <div className="mt-3">{actions}</div>}

      <div className="mt-auto flex flex-col gap-3 pt-4">
        <div>
          <StatusLabel status={status} />
        </div>
        <div className="border-t border-gray-300 pt-3">{source}</div>
      </div>
    </article>
  )
}
