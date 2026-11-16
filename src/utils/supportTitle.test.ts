import { describe, expect, it } from 'vitest'
import { supportDisplayTitle } from './supportTitle'

describe('supportDisplayTitle — 관할 지역센터 카드 제목', () => {
  it('끝이 " 지역센터 연락처 안내"면 센터 이름만', () => {
    expect(supportDisplayTitle('서울서대문센터 지역센터 연락처 안내')).toBe('서울서대문센터')
  })

  it('끝이 다르면 서버 제목 그대로', () => {
    expect(supportDisplayTitle('창업·경영 상담 안내')).toBe('창업·경영 상담 안내')
    expect(supportDisplayTitle('지역센터 연락처 안내 모음')).toBe('지역센터 연락처 안내 모음')
  })

  it('문구만 있으면 그대로', () => {
    expect(supportDisplayTitle(' 지역센터 연락처 안내')).toBe(' 지역센터 연락처 안내')
    expect(supportDisplayTitle('지역센터 연락처 안내')).toBe('지역센터 연락처 안내')
  })
})
