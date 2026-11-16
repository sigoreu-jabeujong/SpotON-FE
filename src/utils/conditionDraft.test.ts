import { describe, expect, it } from 'vitest'
import { parseDiagnosisQuery, toDiagnosisSearch } from '../hooks/useDiagnosisQuery'
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
      franchise: 'all',
      brandScope: 'all',
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
    expect(sameDraft(d, { ...d, brandScope: 'chain' })).toBe(false)
  })

  it('v2: 브랜드·체인을 고르면 요청 세 값(미확인 제외·추정 근거 포함)으로', () => {
    const q = parseDiagnosisQuery(new URLSearchParams(base), 'v2')
    const patch = draftToPatch({ ...draftFromQuery(q), brandScope: 'chain', radius: 300 }, true)
    expect(patch).toMatchObject({
      radius: 300,
      brandScope: 'chain',
      brandUnknown: 'exclude',
      brandEvidence: 'include_estimates',
    })
    expect(patch).not.toHaveProperty('franchise')
    // 주소·좌표·건물 키는 그대로 남는다
    const next = parseDiagnosisQuery(
      new URLSearchParams(toDiagnosisSearch({ ...q, ...patch }, 'v2')),
      'v2',
    )
    expect(next).toMatchObject({
      address: q.address,
      lat: q.lat,
      lng: q.lng,
      buildingKey: q.buildingKey,
      radius: 300,
      brandScope: 'chain',
    })
  })

  it('v1: 가맹 필터를 그대로, 브랜드 값은 보내지 않음', () => {
    const q = parseDiagnosisQuery(new URLSearchParams(base), 'v1')
    const patch = draftToPatch({ ...draftFromQuery(q), franchise: 'franchise' }, false)
    expect(patch).toMatchObject({ franchise: 'franchise' })
    expect(patch).not.toHaveProperty('brandScope')
  })

  it('음식점 → 카페로 바꾸면 세부 업종은 비운다', () => {
    const q = parseDiagnosisQuery(
      new URLSearchParams(base.replace('category=cafe', 'category=restaurant') + '&sub=korean'),
      'v2',
    )
    const patch = draftToPatch({ ...draftFromQuery(q), category: 'cafe' }, true)
    expect(patch).toMatchObject({ category: 'cafe', subCategories: [] })
  })
})
