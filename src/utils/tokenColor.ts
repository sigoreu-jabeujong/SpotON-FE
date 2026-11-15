/**
 * 디자인 토큰(CSS 변수) 색 값을 읽는다 — SVG 속성(recharts)·카카오 지도 SDK처럼 var()를 직접 못 쓰는 곳용.
 * 토큰은 src/index.css의 `@theme static`(차트·지도 색)에 있다. 브라우저가 아니거나 값을 못 읽으면 fallback
 */
export function tokenColor(name: `--${string}`, fallback: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}
