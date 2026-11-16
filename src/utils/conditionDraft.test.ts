import { describe, expect, it } from 'vitest'
import { parseDiagnosisQuery } from '../hooks/useDiagnosisQuery'
import { draftFromQuery, draftToPatch, sameDraft } from './conditionDraft'

const base = 'address=서울+마포구+양화로+16&category=cafe&lat=37.5482&lng=126.9111&bk=k&gu=마포구'

describe('조건 바꾸기 팝업 — URL 조건 ↔ 초안', () => {
  it('지금 조건을 그대로 초안으로 (주소는 초안에 없음)', () => {
    const q = parseDiagnosisQuery(
      new URLSearchParams(`${base}&radius=1000&area=lt33&asOf=2024-05`),
      'v2',
    )
    expect(draftFromQuery(q)).toEqual({
      category: 'cafe',
      subCategories: [],
      radius: 1000,
      area: 'lt33',
      asOf: '2024-05',
    })
  })

  it('바뀐 게 없으면 같다 (세부 업종 순서는 상관없음)', () => {
    const q = parseDiagnosisQuery(
      new URLSearchParams(
        base.replace('category=cafe', 'category=restaurant') + '&sub=korean,japanese',
      ),
      'v2',
    )
    const d = draftFromQuery(q)
    expect(sameDraft(d, { ...d, subCategories: [...d.subCategories].reverse() })).toBe(true)
    expect(sameDraft(d, { ...d, radius: 300 })).toBe(false)
  })

  it('음식점 → 카페로 바꾸면 세부 업종은 비운다', () => {
    const q = parseDiagnosisQuery(
      new URLSearchParams(base.replace('category=cafe', 'category=restaurant') + '&sub=korean'),
      'v2',
    )
    const patch = draftToPatch({ ...draftFromQuery(q), category: 'cafe' })
    expect(patch).toMatchObject({ category: 'cafe', subCategories: [] })
  })
})
