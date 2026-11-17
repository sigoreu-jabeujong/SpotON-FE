import { useEffect, useRef, useState } from 'react'

/**
 * 가로로 스크롤되는 상자(휴대폰의 넓은 표)에서 오른쪽에 더 볼 내용이 남아 있으면 true.
 * 상자에 data-scroll-more를 달아 오른쪽 끝을 흐리게 하면 "옆으로 밀 수 있다"는 게 보인다.
 * 끝까지 밀었거나 스크롤이 없으면(데스크톱) false
 */
export function useScrollMore<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [more, setMore] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
    update()
    el.addEventListener('scroll', update, { passive: true })
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
    resize?.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      resize?.disconnect()
    }
  }, [])
  return [ref, more] as const
}
