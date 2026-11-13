import { describe, expect, it, vi } from 'vitest'
import { createWarmUp } from './health'

const memoryStorage = () => {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
  }
}

describe('백엔드 미리 깨우기 (warm-up)', () => {
  it('목업 모드에서는 health를 보내지 않는다', () => {
    const ping = vi.fn(() => Promise.resolve())
    const warmUp = createWarmUp({ isMock: true, ping, storage: memoryStorage() })
    warmUp()
    warmUp()
    expect(ping).not.toHaveBeenCalled()
  })

  it('실제 서버 모드에서는 여러 번 불러도 한 번만 보낸다', () => {
    const ping = vi.fn(() => Promise.resolve())
    const warmUp = createWarmUp({ isMock: false, ping, storage: memoryStorage() })
    warmUp()
    warmUp()
    warmUp()
    expect(ping).toHaveBeenCalledTimes(1)
  })

  it('같은 탭에서 이미 보냈으면(새로고침 등) 다시 보내지 않는다', () => {
    const storage = memoryStorage()
    createWarmUp({ isMock: false, ping: () => Promise.resolve(), storage })()
    const ping = vi.fn(() => Promise.resolve())
    createWarmUp({ isMock: false, ping, storage })()
    expect(ping).not.toHaveBeenCalled()
  })

  it('저장소를 못 써도 한 번은 보내고, 실패는 조용히 무시한다', async () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }
    const ping = vi.fn(() => Promise.reject(new Error('cold')))
    const warmUp = createWarmUp({ isMock: false, ping, storage: broken })
    expect(() => warmUp()).not.toThrow()
    warmUp()
    expect(ping).toHaveBeenCalledTimes(1)
    await Promise.resolve()
  })
})
