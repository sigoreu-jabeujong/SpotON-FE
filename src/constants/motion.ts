/**
 * 모션 시간 (ms) — src/index.css의 --duration-* 토큰과 같은 값.
 * CSS로 줄 수 없는 곳(차트 라이브러리 등)에서만 쓴다.
 */
export const MOTION_MS = {
  fast: 150,
  base: 250,
  slow: 400,
} as const

/** 동작 줄이기 설정 여부 (움직임을 끄거나 즉시 이동할 때) */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

/** 부드러운 스크롤 — 동작 줄이기면 즉시 이동 */
export const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth')
