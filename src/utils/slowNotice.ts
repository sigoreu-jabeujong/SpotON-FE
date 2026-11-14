/** 로딩이 이 시간보다 길어지면 "처음 불러올 때는 시간이 조금 걸려요" 안내를 보여준다 */
export const SLOW_NOTICE_MS = 5000

/**
 * 안내 자리 하나 — 한 화면에 로딩 영역이 여러 개여도 안내는 하나만 보이게 (먼저 5초를 넘긴 영역이 차지).
 * 차지한 영역이 사라지면 자리를 돌려준다
 */
export function createNoticeSlot() {
  let owner: symbol | null = null
  return {
    claim(id: symbol): boolean {
      if (owner !== null && owner !== id) return false
      owner = id
      return true
    },
    release(id: symbol): void {
      if (owner === id) owner = null
    },
  }
}

export const slowNoticeSlot = createNoticeSlot()
