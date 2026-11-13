import { describe, expect, it } from 'vitest'
import { formatDate, formatOperatingMonths, formatPeriod } from './format'

describe('formatPeriod — 기간 표기', () => {
  it.each([
    // BE 구간 "(시작 제외, 종료 포함]" → 양 끝을 포함한 날짜
    ['(2025-11-08, 2026-11-08]', '2025.11.09 ~ 2026.11.08'],
    // 월말·연말을 넘기는 다음 날
    ['(2023-12-31, 2024-12-31]', '2024.01.01 ~ 2024.12.31'],
    // 윤년 2/29
    ['(2024-02-28, 2025-02-28]', '2024.02.29 ~ 2025.02.28'],
    // 닫힌 시작 "[", 열린 끝 ")" → 끝은 전날
    ['[2025-01-01, 2025-03-01)', '2025.01.01 ~ 2025.02.28'],
    // 연·월 기간
    ['2025-11~2026-10', '2025.11 ~ 2026.10'],
    // 분기
    ['2026-Q2', '2026년 2분기'],
  ])('%s → %s', (input, expected) => {
    expect(formatPeriod(input)).toBe(expected)
  })

  it('결과에 수학식 괄호가 남지 않는다', () => {
    expect(formatPeriod('(2025-11-08, 2026-11-08]')).not.toMatch(/[([\])]/)
  })

  it.each([null, undefined, ''])('%j → null', (v) => {
    expect(formatPeriod(v)).toBeNull()
  })
})

describe('formatOperatingMonths — 영업 개월', () => {
  it.each([
    [0, '0개월'],
    [5, '5개월'],
    [12, '1년'],
    [26, '2년 2개월'],
  ])('%d → %s', (m, expected) => {
    expect(formatOperatingMonths(m)).toBe(expected)
  })

  it('null(미산정)은 0개월이 아니라 null', () => {
    expect(formatOperatingMonths(null)).toBeNull()
  })
})

describe('formatDate', () => {
  it('YYYY-MM-DD → YYYY.MM.DD', () => {
    expect(formatDate('2026-11-08')).toBe('2026.11.08')
  })

  it('null → null', () => {
    expect(formatDate(null)).toBeNull()
  })
})
