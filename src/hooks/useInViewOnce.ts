import { useEffect, useRef, useState } from 'react'

/**
 * 움직임 없이 처음부터 최종 모양으로 그릴 때 — 서버 렌더·테스트(IntersectionObserver 없음),
 * 동작 줄이기, 인쇄 중. (인쇄는 index.css @media print 규칙으로도 최종 모양을 강제한다)
 */
export function showAtOnce(): boolean {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return true
  const media = (q: string) => window.matchMedia?.(q).matches ?? false
  return media('(prefers-reduced-motion: reduce)') || media('print')
}

/**
 * 요소가 화면에 처음 보이면 true — 한 번만 바뀌고 다시 false로 돌아가지 않는다.
 * STEP 03 참고지표 도넛·서울 평균 비교 막대 채움에 쓴다 (모션 예외 — docs/decisions.md).
 * enabled가 false면(그릴 값이 없음) 관찰하지 않는다
 */
export function useInViewOnce<T extends Element>({
  enabled = true,
  threshold = 0.4,
}: { enabled?: boolean; threshold?: number } = {}) {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(showAtOnce)
  useEffect(() => {
    if (shown || !enabled || !ref.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [shown, enabled, threshold])
  return [ref, shown] as const
}
