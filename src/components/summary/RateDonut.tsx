import type { ReactNode } from 'react'
import type { DataStatus } from '../../constants/labels'
import { DATA_STATUS } from '../../constants/labels'
import { cn } from '../../utils/cn'
import { StatusIcon } from '../common/StatusLabel'

/** 링 반지름·굵기 (viewBox 100 기준) */
const R = 42
const STROKE = 10
const CIRCUMFERENCE = 2 * Math.PI * R

type Props = {
  /** 서버가 준 비율 값(%) 그대로 — 없으면(판단 보류·자료 없음) null */
  percent: number | null
  /** 가운데 큰 숫자 (형식 변환까지 끝난 값, 예: "14.3%") */
  text: string | null
  /** 값이 없을 때의 상태와 사유 (링 옆 글자) */
  empty: { status: DataStatus; text: string | null }
  /** 서울 평균·분자/분모 같은 작은 설명 — 768px 이상은 도넛 오른쪽 세로로, 휴대폰은 도넛 아래 */
  details?: ReactNode
}

/**
 * 비율 지표 도넛 — 서버 % 값을 0~100 눈금에 그대로 채운다 (계산·반올림 없음).
 * 값이 없으면 숫자를 채우지 않고 빈 회색 링 + 상태 글자("판단 보류" 등)와 사유.
 * 그림은 aria-hidden, 값·상태는 글자로 읽힌다.
 */
export default function RateDonut({ percent, text, empty, details }: Props) {
  const has = percent !== null && text !== null
  const filled = has ? (Math.min(100, Math.max(0, percent)) / 100) * CIRCUMFERENCE : 0
  const reason = !has && empty.text
  // 사유 글자 — 휴대폰은 도넛 바로 옆, 768px 이상은 오른쪽 설명 묶음 맨 위 (한쪽만 보이고 다른 쪽은 display:none)
  const reasonText = (className: string) =>
    reason && (
      <p
        className={cn(
          'flex items-start gap-1.5 text-caption font-semibold break-keep text-gray-600',
          className,
        )}
      >
        <StatusIcon status={empty.status} className="mt-0.5 size-4 shrink-0" />
        <span>{empty.text}</span>
      </p>
    )
  return (
    <div className="flex items-center gap-5 max-md:flex-col max-md:items-start max-md:gap-2">
      <div className="flex items-center gap-4">
        <div className="relative size-26 shrink-0">
          <svg data-donut viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              strokeWidth={STROKE}
              className={has ? 'stroke-blue-100' : 'stroke-gray-300'}
            />
            {has && (
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                strokeWidth={STROKE}
                strokeLinecap={filled > 0 ? 'round' : 'butt'}
                strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
                className="stroke-blue-500"
              />
            )}
          </svg>
          <p
            className={cn(
              'absolute inset-0 flex items-center justify-center text-center font-bold tabular-nums',
              has ? 'text-subtitle text-gray-900' : 'text-caption text-gray-600',
            )}
          >
            {has ? text : DATA_STATUS[empty.status].label}
          </p>
        </div>
        {reasonText('md:hidden')}
      </div>
      {(reason || details) && (
        <div className="flex min-w-0 flex-col gap-2 text-caption text-gray-600">
          {reasonText('max-md:hidden')}
          {details}
        </div>
      )}
    </div>
  )
}
