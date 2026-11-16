import type { CSSProperties } from 'react'

/**
 * 랜딩 전국 지도 뒤 궤도 장식 — 가운데 파란 빛(그림) + 궤도선 2개(SVG) + 파란 구슬 3개.
 * 예전에는 home-gradient.webp 한 장에 모두 그려져 있었다. 구슬만 움직일 수 있게 빛은 선·구슬을 지운 그림(home-glow.webp),
 * 선·구슬은 코드로 그린다. 좌표·크기는 원래 그림(2000×1027)에서 잰 값 그대로 (궤도 상자 기준 %).
 * 장식이라 aria-hidden·pointer-events-none
 */

/** 원래 그림 크기 — SVG viewBox·비율 기준 */
const ORBIT_BOX = { width: 2000, height: 1027 }
/** 바깥·안쪽 궤도 타원 (원래 그림에서 선 픽셀로 맞춘 값) */
const ORBITS = {
  outer: { cx: 999.51, cy: 497.39, rx: 923.61, ry: 421.53 },
  inner: { cx: 996.23, cy: 494.1, rx: 588.38, ry: 268.69 },
}

type Bead = {
  /** 바깥 궤도 위 시작 위치 (오른쪽 끝에서 시계 방향으로 잰 호 길이 비율 0~1) */
  frac: number
  /** 그 자리 (궤도 상자 기준 %) */
  x: number
  y: number
  /** 그 자리에서 궤도 바깥(법선) 방향 각도 — 공전하면서 이 각도가 바뀐다 */
  angle: number
  /** 원래 그림의 명암 방향(가로)과 법선 방향의 차이 — 멈춘 그림이 예전과 같게 고정으로 더한다 */
  tilt: number
  /** 지름 (궤도 상자 너비 기준 %) */
  size: number
  /** 원래 그림의 구슬이 궤도선에서 살짝 벗어나 있던 만큼 (dx: 상자 너비 기준 %, dy: 높이 기준 %) — 멈춘 그림이 예전과 같게 */
  dx: number
  dy: number
  /** 한 바퀴 시간(초) — 구슬마다 다르게 */
  duration: number
  /** 진한 쪽 색 */
  dark: string
}

const BEADS: Bead[] = [
  // 왼쪽 위 중간 크기
  {
    frac: 0.5482,
    x: 8.389,
    y: 30.585,
    angle: 226.61,
    tilt: -46.61,
    size: 2.45,
    dx: -0.139,
    dy: -0.059,
    duration: 38,
    dark: '#6497f4',
  },
  // 오른쪽 큰 것
  {
    frac: 0.039,
    x: 92.957,
    y: 63.442,
    angle: 40.73,
    tilt: -40.73,
    size: 3.35,
    dx: -0.432,
    dy: -0.151,
    duration: 44,
    dark: '#83abff',
  },
  // 아래 작은 것
  {
    frac: 0.1884,
    x: 63.391,
    y: 87.706,
    angle: 82.11,
    tilt: -82.11,
    size: 1.4,
    dx: -0.091,
    dy: -0.267,
    duration: 32,
    dark: '#aac5fe',
  },
]

const ratio = ORBIT_BOX.height / ORBIT_BOX.width

export default function LandingOrbit({ glow }: { glow: string }) {
  return (
    <div
      data-landing-orbit
      aria-hidden="true"
      className="pointer-events-none absolute top-[18%] left-1/2 w-[118%] max-w-none -translate-x-1/2"
    >
      <img src={glow} alt="" aria-hidden="true" className="block w-full" />
      <svg
        viewBox={`0 0 ${ORBIT_BOX.width} ${ORBIT_BOX.height}`}
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        {Object.entries(ORBITS).map(([key, o]) => (
          <ellipse
            key={key}
            cx={o.cx}
            cy={o.cy}
            rx={o.rx}
            ry={o.ry}
            fill="none"
            // 원래 그림의 가는 연파랑 선 (흰 바탕에서 약 #d4def9)
            stroke="#3376fd"
            strokeOpacity={key === 'outer' ? 0.115 : 0.13}
            strokeWidth={2}
          />
        ))}
      </svg>
      {BEADS.map((b) => (
        // 바깥 칸(궤도 상자 전체)을 옮기면 % 이동이 상자 기준이 된다 — 움직임은 transform만
        <div
          key={b.duration}
          className="absolute inset-0"
          style={{ transform: `translate(${b.x}%, ${b.y}%)` } as CSSProperties}
        >
          <div
            data-orbit-bead
            className="absolute top-0 left-0 aspect-square"
            style={{
              width: `${b.size}%`,
              // 가운데 맞추기 + 원래 그림과의 작은 차이 (margin %는 상자 너비 기준)
              marginLeft: `${-b.size / 2 + b.dx}%`,
              marginTop: `${-b.size / 2 + b.dy * ratio}%`,
              transform: `rotate(${b.angle}deg)`,
            }}
          >
            <span
              className="block size-full rounded-full opacity-75"
              style={{
                // 원래 그림의 구슬 명암 — 거의 흰빛(20%)에서 진한 파랑(85%)까지 고르게
                backgroundImage: `linear-gradient(to right, #f2f6fe 20%, ${b.dark} 85%)`,
                transform: `rotate(${b.tilt}deg)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
