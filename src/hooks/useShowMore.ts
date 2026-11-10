import { useState } from 'react'

/** 처음에 보여줄 개수이자 "더보기"를 누를 때마다 늘어나는 개수 (Figma 설명: 5개씩) */
export const SHOW_MORE_STEP = 5

/**
 * 목록 "더보기" 상태 — 처음 step개, 누를 때마다 step개씩 추가.
 * 다 보이면 hasMore=false(버튼 숨김), step개 이하면 처음부터 false.
 * 목록 자체가 바뀌면(조건 변경 등) 다시 처음 step개부터 보여준다.
 */
export function useShowMore<T>(items: readonly T[], step: number = SHOW_MORE_STEP) {
  const [count, setCount] = useState(step)
  const [prevItems, setPrevItems] = useState(items)

  // 목록이 바뀌면 개수를 처음으로 되돌린다 (렌더 중 상태 조정 — React 권장 방식)
  if (prevItems !== items) {
    setPrevItems(items)
    setCount(step)
  }

  const visible = items.slice(0, count)
  return {
    visible,
    total: items.length,
    shown: visible.length,
    hasMore: items.length > count,
    showMore: () => setCount((c) => c + step),
  }
}
