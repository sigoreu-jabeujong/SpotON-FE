import { describe, expect, it } from 'vitest'
import { MIN_AS_OF } from '../constants/diagnosis'
import { parseDiagnosisQuery } from '../hooks/useDiagnosisQuery'
import { clampMonthRange } from './date'

describe('clampMonthRange — 기준 시점 선택은 2010년부터', () => {
  it('서버 시작이 더 이르면 2010-01로 자르고 끝은 서버 값 그대로', () => {
    expect(clampMonthRange({ min_month: '1967-10', max_month: '2026-11' }, MIN_AS_OF)).toEqual({
      min_month: '2010-01',
      max_month: '2026-11',
    })
  })
  it('서버 시작이 2010 이후면 그대로', () => {
    const range = { min_month: '2012-05', max_month: '2026-11' }
    expect(clampMonthRange(range, MIN_AS_OF)).toEqual(range)
  })
  it('과거 자료 없음(null)은 그대로', () => {
    expect(
      clampMonthRange({ min_month: null, max_month: '2026-11' }, MIN_AS_OF).min_month,
    ).toBeNull()
  })
  it('끝이 2010보다 이르면 고를 과거 달이 없다 (null)', () => {
    expect(
      clampMonthRange({ min_month: '2001-01', max_month: '2008-12' }, MIN_AS_OF).min_month,
    ).toBeNull()
  })
})

describe('예전 링크의 2010년 이전 기준 시점', () => {
  it('2005-03 → 2010-01로 맞춘다 (오류 화면 대신)', () => {
    expect(parseDiagnosisQuery(new URLSearchParams('asOf=2005-03'), 'v1').asOf).toBe('2010-01')
  })
  it('2010년 이후 값은 그대로', () => {
    expect(parseDiagnosisQuery(new URLSearchParams('asOf=2015-07'), 'v1').asOf).toBe('2015-07')
  })
})
