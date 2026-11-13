import { describe, expect, it } from 'vitest'
import { storeKey } from './storeKey'

describe('storeKey — 점포 식별 (source + license_no)', () => {
  it('관리번호가 같아도 원천이 다르면 다른 값', () => {
    expect(storeKey('rest_cafe', 'A-1')).not.toBe(storeKey('general_restaurant', 'A-1'))
  })

  it('원천·관리번호가 같으면 같은 값', () => {
    expect(storeKey('rest_cafe', 'A-1')).toBe(storeKey('rest_cafe', 'A-1'))
  })

  it('"원천:관리번호" 모양', () => {
    expect(storeKey('rest_cafe', 'A-1')).toBe('rest_cafe:A-1')
  })
})
