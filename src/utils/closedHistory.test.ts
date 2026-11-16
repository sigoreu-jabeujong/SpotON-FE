import { describe, expect, it } from 'vitest'
import { parseDiagnosisQuery, toDiagnosisSearch } from '../hooks/useDiagnosisQuery'
import { closedHistoryParams } from './closedHistory'

const q = (floor: string) =>
  parseDiagnosisQuery(
    new URLSearchParams({
      bk: '마포구-서교동-490-0',
      address: '서울 마포구 양화로 45',
      lat: '37.55',
      lng: '126.92',
      floor,
      category: 'cafe',
    }),
    'v2',
  )
describe('automatic location selection', () => {
  it('allows address-only lookup but never infers a floor from a unit', () => {
    expect(closedHistoryParams(q('201호'))).toBeNull()
    expect(closedHistoryParams(q(''))?.scope).toBe('address')
    expect(closedHistoryParams({ ...q('2층'), detailUnverified: true })).toBeNull()
  })
  it('uses the entered detail and ignores removed scope controls', () => {
    expect(closedHistoryParams(q('2층 201호'))?.scope).toBe('unit')
    expect(closedHistoryParams(q('2층'))?.scope).toBe('floor')
    expect(closedHistoryParams({ ...q('2층 201호'), historyScope: 'floor' })?.scope).toBe('unit')
    expect(closedHistoryParams({ ...q('2층'), historyScope: 'unit' })?.scope).toBe('floor')
  })
  it('restores old URLs using the current automatic policy', () => {
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
    expect(closedHistoryParams(restored)?.identity_requirement).toBe('address_scope')
  })
})
