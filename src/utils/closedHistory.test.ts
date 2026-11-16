import { describe, expect, it } from 'vitest'
import { parseDiagnosisQuery, toDiagnosisSearch } from '../hooks/useDiagnosisQuery'
import { closedHistoryParams } from './closedHistory'

const q = (floor: string) =>
  parseDiagnosisQuery(
    new URLSearchParams({ bk: '마포구-서교동-490-0', floor, category: 'cafe' }),
    'v2',
  )
describe('closed location selection', () => {
  it('requires an explicit floor and never infers one from a unit', () => {
    expect(closedHistoryParams(q('201호'))).toBeNull()
    expect(closedHistoryParams(q(''))).toBeNull()
    expect(closedHistoryParams({ ...q('2층'), detailUnverified: true })).toBeNull()
  })
  it('defaults to exact unit and only widens with explicit selection', () => {
    expect(closedHistoryParams(q('2층 201호'))?.scope).toBe('unit')
    expect(closedHistoryParams(q('2층'))?.scope).toBe('floor')
    expect(closedHistoryParams({ ...q('2층 201호'), historyScope: 'floor' })?.scope).toBe('floor')
    expect(closedHistoryParams({ ...q('2층'), historyScope: 'unit' })).toBeNull()
  })
  it('round trips scope and building evidence without changing address details', () => {
    const initial = {
      ...q('2층 201호'),
      historyScope: 'floor' as const,
      historyIdentity: 'verified_building' as const,
    }
    const restored = parseDiagnosisQuery(
      new URLSearchParams(toDiagnosisSearch(initial, 'v2')),
      'v2',
    )
    expect(closedHistoryParams(restored)).toEqual(closedHistoryParams(initial))
  })
})
