import { describe, expect, it } from 'vitest'
import { withGaps } from './trend'

describe('withGaps — 연도별 추이 선 그래프의 빈 연도', () => {
  it('자료가 없는 연도는 0이 아니라 값 없음(null)으로 끼워 넣어 선이 끊기게', () => {
    expect(
      withGaps([
        { year: 1971, opened: 1, closed: 0 },
        { year: 1974, opened: 2, closed: 1 },
      ]),
    ).toEqual([
      { year: 1971, opened: 1, closed: 0 },
      { year: 1972, opened: null, closed: null },
      { year: 1973, opened: null, closed: null },
      { year: 1974, opened: 2, closed: 1 },
    ])
  })

  it('서버 값(0 포함)은 그대로', () => {
    const rows = [
      { year: 2024, opened: 0, closed: 3 },
      { year: 2025, opened: 5, closed: 0 },
    ]
    expect(withGaps(rows)).toEqual(rows)
  })
})
