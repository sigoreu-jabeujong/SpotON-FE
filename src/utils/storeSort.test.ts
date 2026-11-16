import { describe, expect, it } from 'vitest'
import { sortByOperatingPeriod, sortStores } from './storeSort'

const s = (id: string, operating_months: number | null) => ({ id, operating_months })
const ids = (rows: readonly { id: string }[]) => rows.map((r) => r.id).join(',')

describe('sortByOperatingPeriod — 영업 기간 순', () => {
  it('영업 기간이 긴 점포부터', () => {
    expect(ids(sortByOperatingPeriod([s('a', 8), s('b', 170), s('c', 58)]))).toBe('b,c,a')
  })
  it('영업 기간이 없는(null) 점포는 맨 뒤, 그 안에서는 원래 순서', () => {
    expect(ids(sortByOperatingPeriod([s('a', null), s('b', 3), s('c', null), s('d', 0)]))).toBe(
      'b,d,a,c',
    )
  })
  it('같은 기간이면 원래(서버) 순서 유지', () => {
    expect(ids(sortByOperatingPeriod([s('a', 12), s('b', 12), s('c', 24)]))).toBe('c,a,b')
  })
  it('원래 배열은 바꾸지 않는다', () => {
    const rows = [s('a', 1), s('b', 2)]
    sortByOperatingPeriod(rows)
    expect(ids(rows)).toBe('a,b')
  })
})

describe('sortStores', () => {
  it('가까운 순은 받은 배열 그대로 (같은 참조)', () => {
    const rows = [s('a', 1), s('b', 2)]
    expect(sortStores(rows, 'nearest')).toBe(rows)
  })
  it('영업 기간 순', () => {
    expect(ids(sortStores([s('a', 1), s('b', 2)], 'period'))).toBe('b,a')
  })
})
