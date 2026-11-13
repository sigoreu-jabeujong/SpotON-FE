import { describe, expect, it } from 'vitest'
import { historyStore } from '../test/fixtures'
import { sortHistoryRecentFirst } from './history'
import { storeKey } from './storeKey'

const keys = (rows: ReturnType<typeof sortHistoryRecentFirst>) =>
  rows.map((s) => storeKey(s.source, s.license_no))

describe('sortHistoryRecentFirst — 이력 표·진단서 정렬', () => {
  it('최근 개업 순', () => {
    const rows = [
      historyStore({ license_no: 'old', open_date: '2010-05-01' }),
      historyStore({ license_no: 'new', open_date: '2024-02-01' }),
      historyStore({ license_no: 'mid', open_date: '2018-07-15' }),
    ]
    expect(sortHistoryRecentFirst(rows).map((s) => s.license_no)).toEqual(['new', 'mid', 'old'])
  })

  it('개업일 null은 맨 뒤', () => {
    const rows = [
      historyStore({ license_no: 'none', open_date: null }),
      historyStore({ license_no: 'a', open_date: '2015-01-01' }),
      historyStore({ license_no: 'b', open_date: '2020-01-01' }),
    ]
    expect(sortHistoryRecentFirst(rows).map((s) => s.license_no)).toEqual(['b', 'a', 'none'])
  })

  it('같은 날짜는 source → license_no 순으로 고정', () => {
    const rows = [
      historyStore({ source: 'rest_cafe', license_no: 'A', open_date: '2020-01-01' }),
      historyStore({ source: 'general_restaurant', license_no: 'B', open_date: '2020-01-01' }),
      historyStore({ source: 'general_restaurant', license_no: 'A', open_date: '2020-01-01' }),
    ]
    expect(keys(sortHistoryRecentFirst(rows))).toEqual([
      'general_restaurant:A',
      'general_restaurant:B',
      'rest_cafe:A',
    ])
  })

  it('같은 관리번호·다른 원천 두 행을 합치지 않는다', () => {
    const rows = [
      historyStore({ source: 'rest_cafe', license_no: 'SAME' }),
      historyStore({ source: 'general_restaurant', license_no: 'SAME' }),
    ]
    expect(sortHistoryRecentFirst(rows)).toHaveLength(2)
  })

  it('원본 배열(React Query 캐시)은 바뀌지 않는다', () => {
    const rows = [
      historyStore({ license_no: 'old', open_date: '2010-01-01' }),
      historyStore({ license_no: 'new', open_date: '2024-01-01' }),
    ]
    const before = rows.map((s) => s.license_no)
    const sorted = sortHistoryRecentFirst(rows)
    expect(rows.map((s) => s.license_no)).toEqual(before)
    expect(sorted).not.toBe(rows)
  })
})
