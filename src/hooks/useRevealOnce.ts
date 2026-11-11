import { useEffect, useRef, useState } from 'react'

export type RevealState = 'hidden' | 'shown'

/**
 * 요소가 화면에 처음 들어올 때 한 번만 등장 효과를 준다 (반복하지 않음).
 * 반환한 ref를 요소에 달고 data-reveal={state}로 넘기면 index.css가 움직임을 맡는다.
 * 동작 줄이기 설정이거나 IntersectionObserver가 없으면 처음부터 보인다.
 */
export function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [state, setState] = useState<RevealState>(() =>
    typeof IntersectionObserver === 'undefined' ? 'shown' : 'hidden',
  )

  useEffect(() => {
    const el = ref.current
    if (!el || state === 'shown') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState('shown')
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [state])

  return [ref, state] as const
}
