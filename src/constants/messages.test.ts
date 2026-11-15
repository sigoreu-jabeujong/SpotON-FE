import { describe, expect, it } from 'vitest'
import { getErrorMessage } from './messages'

describe('오류 문구 매핑', () => {
  it('TIMEOUT은 "서버를 준비하는 중" 안내 (잠든 무료 서버가 깨어나는 중)', () => {
    expect(getErrorMessage('TIMEOUT')).toBe('서버를 준비하는 중이에요. 잠시 후 다시 시도해 주세요.')
  })

  it('모르는 코드는 공통 오류 문구', () => {
    expect(getErrorMessage('SOMETHING_NEW')).not.toMatch(/SOMETHING_NEW/)
  })
})
