import { describe, expect, it } from 'vitest'
import { extractPhone, linkPhone, telHref } from './phone'

describe('extractPhone — description 안 전화번호', () => {
  it('실제 BE 문구에서 번호를 꺼낸다', () => {
    expect(
      extractPhone(
        '2026년 공고 별표2 기준 관할: 서대문구·은평구·마포구. 전화: 02-323-2915. 연결된 공고의 첨부 PDF 25쪽을 확인하세요.',
      ),
    ).toBe('02-323-2915')
  })

  it.each([
    ['전화 031-123-4567', '031-123-4567'],
    ['연락처: 010-1234-5678', '010-1234-5678'],
    ['전화번호：02-1234-5678', '02-1234-5678'],
    ['Tel: 1588-1234', '1588-1234'],
  ])('%s → %s', (text, phone) => {
    expect(extractPhone(text)).toBe(phone)
  })

  it('번호가 없거나 "전화" 같은 이름표가 없으면 null (기간·날짜를 번호로 착각하지 않음)', () => {
    expect(extractPhone('공식 홈페이지에서 창업·경영 상담과 지원 안내를 확인하세요.')).toBeNull()
    expect(extractPhone('2026-10-01 공고, 25쪽')).toBeNull()
    expect(extractPhone('전화: 02-323')).toBeNull()
    expect(extractPhone(null)).toBeNull()
  })
})

describe('linkPhone — phone 필드 우선', () => {
  it('phone 필드가 있으면 그 값', () => {
    expect(linkPhone({ phone: '02-111-2222', description: '전화: 02-323-2915' })).toBe(
      '02-111-2222',
    )
  })
  it('없거나 빈 값이면 description에서', () => {
    expect(linkPhone({ phone: ' ', description: '전화: 02-323-2915' })).toBe('02-323-2915')
    expect(linkPhone({ description: '안내 페이지를 확인하세요' })).toBeNull()
  })
})

describe('telHref', () => {
  it('숫자만 남긴 tel: 주소', () => {
    expect(telHref('02-323-2915')).toBe('tel:023232915')
  })
})
