import { describe, expect, it } from 'vitest'
import { MESSAGES } from '../constants/messages'
import { copyToast, imageSaveToast, TOAST_DURATION_MS } from './toast'

describe('알림(토스트) 표시 규칙', () => {
  it('떠 있는 시간은 2~3초', () => {
    for (const ms of Object.values(TOAST_DURATION_MS)) {
      expect(ms).toBeGreaterThanOrEqual(2000)
      expect(ms).toBeLessThanOrEqual(3000)
    }
  })

  it('요약 이미지: 저장 완료·실패만 알리고, 만드는 중·처음 상태는 알리지 않는다', () => {
    expect(imageSaveToast('done', true)).toEqual({
      tone: 'success',
      message: MESSAGES.toast.imageDone,
    })
    expect(imageSaveToast('failed', true)).toEqual({
      tone: 'error',
      message: MESSAGES.toast.imageFailed,
    })
    expect(imageSaveToast('idle', true)).toBeNull()
    expect(imageSaveToast('making', true)).toBeNull()
  })

  it('요약 이미지: 진단 결과를 아직 못 불러온 실패는 "불러온 뒤 다시"로 안내', () => {
    expect(imageSaveToast('failed', false)?.message).toBe(MESSAGES.toast.imageNeedsData)
  })

  it('복사: 성공·실패 문구가 다르다', () => {
    expect(copyToast(true)).toEqual({ tone: 'success', message: MESSAGES.toast.copyDone })
    expect(copyToast(false)).toEqual({ tone: 'error', message: MESSAGES.toast.copyFailed })
  })

  it('실패 문구는 무엇이 안 됐는지와 어떻게 하면 되는지를 함께 말한다 (영문 코드 없음)', () => {
    for (const m of [
      MESSAGES.toast.imageFailed,
      MESSAGES.toast.imageNeedsData,
      MESSAGES.toast.copyFailed,
    ]) {
      expect(m).toMatch(/주세요/)
      expect(m).not.toMatch(/[A-Z_]{3,}/)
    }
  })
})
