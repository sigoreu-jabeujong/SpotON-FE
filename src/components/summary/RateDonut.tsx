import type { CSSProperties } from 'react'
import { useInViewOnce } from '../../hooks/useInViewOnce'

/** 링 반지름·굵기 (viewBox 100 기준) */
const R = 42
const STROKE = 10
const CIRCUMFERENCE = 2 * Math.PI * R

/**
 * 비율 지표 도넛 링 — 서버 % 값을 0~100 눈금에 그대로 채운다 (계산·반올림 없음).
 * 숫자·상태 글자는 카드 왼쪽에 크게 있으므로 링 안에는 넣지 않는다 (그림 전체 aria-hidden).
 * 값이 없으면(판단 보류·자료 없음) 파란 링 없이 회색 링만.
 * 파란 링은 화면에 처음 보일 때 한 번만 0에서 값까지 차오른다(약 0.8초, 결과 화면 등장 애니메이션 예외 — docs/decisions.md).
 * 서버 렌더·동작 줄이기·인쇄는 처음부터 최종 값.
 */
export default function RateDonut({ percent }: { percent: number | null }) {
  const has = percent !== null
  const filled = has ? (Math.min(100, Math.max(0, percent)) / 100) * CIRCUMFERENCE : 0
  const full = `${filled} ${CIRCUMFERENCE}`
  // 화면에 들어오면 true — 그 전에는 링을 0으로 두었다가 전환으로 차오른다 (한 번만, 다시 0으로 돌아가지 않음)
  const [svg, shown] = useInViewOnce<SVGSVGElement>({ enabled: has, threshold: 0.4 })
  const dash = shown ? full : `0 ${CIRCUMFERENCE}`
  return (
    // 112px, 휴대폰 80px — 동종업체 수 카드의 가게 그림과 같은 칸
    <div className="size-28 shrink-0 max-sm:size-20" aria-hidden="true">
      <svg ref={svg} data-donut viewBox="0 0 100 100" className="size-full -rotate-90">
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
    </div>
  )
}
