import { apiGet, COLD_START_TIMEOUT_MS } from './client'

/** GET /api/health — 서버가 떠 있는지만 확인 (응답 내용은 쓰지 않는다) */
export function getHealth() {
  return apiGet<{ status: string }>('/health', undefined, { timeoutMs: COLD_START_TIMEOUT_MS })
}

type WarmUpDeps = {
  /** 목업 모드면 아무것도 보내지 않는다 */
  isMock: boolean
  ping: () => Promise<unknown>
  /** 같은 탭에서 한 번만 — 새로고침해도 다시 보내지 않게 sessionStorage에 표시 (못 쓰면 메모리만) */
  storage?: Pick<Storage, 'getItem' | 'setItem'> | null
}

const WARMED_KEY = 'spoton:be-warmed'

/**
 * 미리 깨우기 함수를 만든다 (테스트에서 목업 여부·호출 함수를 바꿔 끼울 수 있게).
 * 결과·실패는 모두 무시하고 화면에 아무것도 표시하지 않는다
 */
export function createWarmUp({ isMock, ping, storage }: WarmUpDeps): () => void {
  let sent = false
  return () => {
    if (isMock || sent) return
    try {
      if (storage?.getItem(WARMED_KEY)) {
        sent = true
        return
      }
      storage?.setItem(WARMED_KEY, '1')
    } catch {
      // 저장소를 못 쓰는 환경(사생활 보호 모드 등)이면 메모리 표시만으로 한 번
    }
    sent = true
    void ping().catch(() => {})
  }
}

function sessionStorageOrNull(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}

/**
 * 잠든 무료 서버(Render)를 랜딩·입력 화면이 열릴 때 미리 깨운다 — 실제 서버 모드(VITE_USE_MOCK=false)에서만, 탭당 한 번.
 * 사용자가 주소를 입력하는 동안 서버가 깨어나 첫 주소 검색이 덜 기다리게 된다
 */
export const warmUpBackend = createWarmUp({
  isMock: import.meta.env.VITE_USE_MOCK === 'true',
  ping: getHealth,
  storage: sessionStorageOrNull(),
})
