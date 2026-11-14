import { describe, expect, it } from 'vitest'
import { createNoticeSlot, SLOW_NOTICE_MS } from './slowNotice'

describe('느린 로딩 안내', () => {
  it('5초가 넘으면 보여준다', () => {
    expect(SLOW_NOTICE_MS).toBe(5000)
  })

  it('한 화면에 하나만 — 먼저 차지한 로딩 영역만 보여준다', () => {
    const slot = createNoticeSlot()
    const a = Symbol('a')
    const b = Symbol('b')
    expect(slot.claim(a)).toBe(true)
    expect(slot.claim(b)).toBe(false)
    expect(slot.claim(a)).toBe(true)
  })

  it('차지한 영역이 사라지면 다른 영역이 차지할 수 있다', () => {
    const slot = createNoticeSlot()
    const a = Symbol('a')
    const b = Symbol('b')
    slot.claim(a)
    slot.release(b)
    expect(slot.claim(b)).toBe(false)
    slot.release(a)
    expect(slot.claim(b)).toBe(true)
  })
})
