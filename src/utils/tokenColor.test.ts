import { describe, expect, it } from 'vitest'
import { tokenColor } from './tokenColor'

describe('tokenColor — 디자인 토큰 색 읽기', () => {
  it('브라우저 밖(테스트·서버)에서는 fallback 색을 돌려준다', () => {
    expect(tokenColor('--color-chart-opened', '#3376fd')).toBe('#3376fd')
  })
})
