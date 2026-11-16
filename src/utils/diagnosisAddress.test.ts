import { describe, expect, it } from 'vitest'
import { parseDiagnosisQuery, toDiagnosisSearch } from '../hooks/useDiagnosisQuery'
import { diagnosisAddress } from './diagnosisAddress'
import { addressIdentity, confirmed, rememberAddress } from './addressConfirmation'

describe('address detail persistence', () => {
  it('keeps confirmation across filter changes but verifies address changes', () => {
    const base = '?address=서울&bk=building&floor=2층&lat=37&lng=127&category=cafe'
    rememberAddress(base)
    expect(confirmed.has(addressIdentity(`${base}&radius=500&area=66`))).toBe(true)
    expect(confirmed.has(addressIdentity(base.replace('2층', '3층')))).toBe(false)
    expect(confirmed.has(addressIdentity(`${base}&floor=3층`))).toBe(false)
  })
  it('round trips floor and raw unverified detail independently', () => {
    const q = parseDiagnosisQuery(
      new URLSearchParams('address=서울+주소&floor=2층&detail=2층+201호'),
      'v2',
    )
    const restored = parseDiagnosisQuery(new URLSearchParams(toDiagnosisSearch(q, 'v2')), 'v2')
    expect(restored.floorUnit).toBe('2층')
    expect(restored.detailText).toBe('2층 201호')
    expect(diagnosisAddress(restored)).toBe('서울 주소 2층')
  })
  it('labels unverified text and never duplicates a floor', () => {
    const q = parseDiagnosisQuery(new URLSearchParams('address=서울+주소+2층&floor=2층'), 'v2')
    expect(diagnosisAddress(q)).toBe('서울 주소 2층')
    expect(
      diagnosisAddress({ ...q, floorUnit: null, detailText: '1~2층', detailUnverified: true }),
    ).toContain('(미확인)')
  })
})
