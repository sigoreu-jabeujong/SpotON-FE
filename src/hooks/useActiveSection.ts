import { useEffect, useState } from 'react'

/** 화면 위쪽에서 이 비율 지점을 지난 마지막 섹션을 "보고 있는 섹션"으로 본다 */
const ACTIVE_LINE_RATIO = 0.3

/**
 * 스크롤 위치로 지금 보고 있는 섹션 id를 돌려준다 (사이드바 하위 메뉴 강조용)
 * @param ids 위에서 아래 순서의 섹션 id (모듈 상수로 넘겨 매번 바뀌지 않게)
 * @param enabled 해당 페이지일 때만 true
 */
export function useActiveSection(ids: readonly string[], enabled: boolean): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    let frame = 0
    const update = () => {
      const line = window.innerHeight * ACTIVE_LINE_RATIO
      let current: string | null = ids[0] ?? null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      // 맨 아래까지 내리면 마지막 섹션 (마지막 섹션이 짧아도 강조되게)
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (atBottom && ids.length > 0) current = ids[ids.length - 1]
      setActive(current)
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids, enabled])

  return enabled ? active : null
}
