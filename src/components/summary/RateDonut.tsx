import type { CSSProperties, ReactNode } from 'react'
import type { DataStatus } from '../../constants/labels'
import { DATA_STATUS } from '../../constants/labels'
import { useInViewOnce } from '../../hooks/useInViewOnce'
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
  /** 서울 평균·분자/분모 같은 설명 — 도넛 오른쪽 세로로 (도넛과 한 묶음으로 카드 가운데) */
  details?: ReactNode
}

/**
 * 비율 지표 도넛 — 서버 % 값을 0~100 눈금에 그대로 채운다 (계산·반올림 없음).
 * 값이 없으면 숫자를 채우지 않고 빈 회색 링 + 상태 글자("판단 보류" 등)와 사유.
 * 그림은 aria-hidden, 값·상태는 글자로 읽힌다.
 * 파란 링은 화면에 처음 보일 때 한 번만 0에서 값까지 차오른다(약 0.8초, 결과 화면 등장 애니메이션 예외 — docs/decisions.md).
 * 가운데 숫자는 처음부터 최종 값(카운트업 없음), 값 없음(회색 링)은 움직이지 않는다.
 */
export default function RateDonut({ percent, text, empty, details }: Props) {
  const has = percent !== null && text !== null
  const filled = has ? (Math.min(100, Math.max(0, percent)) / 100) * CIRCUMFERENCE : 0
  const full = `${filled} ${CIRCUMFERENCE}`
  // 화면에 들어오면 true — 그 전에는 링을 0으로 두었다가 전환으로 차오른다 (한 번만, 다시 0으로 돌아가지 않음).
  // 서버 렌더·동작 줄이기·인쇄면 처음부터 true
  const [svg, shown] = useInViewOnce<SVGSVGElement>({ enabled: has, threshold: 0.4 })
  const dash = shown ? full : `0 ${CIRCUMFERENCE}`
  const reason = !has && empty.text
  // 사유 글자 — 오른쪽 설명 묶음 맨 위
  const reasonText = reason && (
    <p className="flex items-start gap-1.5 text-caption font-semibold break-keep text-gray-600">
      <StatusIcon status={empty.status} className="mt-0.5 size-4 shrink-0" />
      <span>{empty.text}</span>
    </p>
  )
  return (
    // 도넛 + 설명을 한 묶음으로 카드 가운데 — 넓은 카드에서 왼쪽에 몰려 오른쪽이 비지 않게
    <div className="flex w-full items-center justify-center gap-6 lg:gap-10">
      <div className="flex items-center">
        <div className="relative size-28 shrink-0">
          <svg
            ref={svg}
            data-donut
            viewBox="0 0 100 100"
            className="size-full -rotate-90"
            aria-hidden="true"
          >
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
                data-donut-fill
                cx="50"
                cy="50"
                r={R}
                fill="none"
                strokeWidth={STROKE}
                strokeLinecap={filled > 0 ? 'round' : 'butt'}
                // 표시 변환만 — 서버 % 값을 눈금에 그대로 (인쇄는 --donut-full로 최종 값)
                style={{ strokeDasharray: dash, '--donut-full': full } as CSSProperties}
                className="stroke-blue-500 transition-[stroke-dasharray] duration-800 ease-(--ease-out-soft)"
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
      </div>
      {(reason || details) && (
        <div className="flex min-w-0 flex-col gap-2 text-caption break-keep text-gray-600 lg:text-body">
          {reasonText}
          {details}
        </div>
      )}
    </div>
  )
}
