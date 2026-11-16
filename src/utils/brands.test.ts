import { describe, expect, it } from 'vitest'
import { parseDiagnosisQuery } from '../hooks/useDiagnosisQuery'
import { brandConditionSummary, brandSelectionFor, normalizeBrandSelection } from './brands'

const ALL = {
  brandScope: 'all',
  brandUnknown: 'include',
  brandEvidence: 'include_estimates',
} as const
const CHAIN = {
  brandScope: 'chain',
  brandUnknown: 'exclude',
  brandEvidence: 'include_estimates',
} as const

describe('brandSelectionFor — 화면 선택 → 요청 조건', () => {
  it('전체는 미확인 포함·추정 근거 포함 (지금 기본값과 같음)', () => {
    expect(brandSelectionFor('all')).toEqual(ALL)
  })
  it('브랜드·체인은 미확인 제외·추정 근거 포함 (추정 체인만)', () => {
    expect(brandSelectionFor('chain')).toEqual(CHAIN)
  })
})

describe('normalizeBrandSelection — 예전 링크 값 정리', () => {
  it('비체인 조건은 전체로', () => {
    expect(
      normalizeBrandSelection({
        brandScope: 'non_chain',
        brandUnknown: 'exclude',
        brandEvidence: 'confirmed_only',
      }),
    ).toEqual(ALL)
  })
  it('브랜드·체인이면 미확인 제외·추정 근거 포함으로', () => {
    for (const brandUnknown of ['include', 'exclude'] as const)
      for (const brandEvidence of ['include_estimates', 'confirmed_only'] as const)
        expect(
          normalizeBrandSelection({ brandScope: 'chain', brandUnknown, brandEvidence }),
        ).toEqual(CHAIN)
  })
  it('전체면 미확인 포함·추정 근거 포함으로 (예전 미확인 제외·확인 근거만도)', () => {
    expect(
      normalizeBrandSelection({
        brandScope: 'all',
        brandUnknown: 'exclude',
        brandEvidence: 'confirmed_only',
      }),
    ).toEqual(ALL)
  })
  it('값이 없으면 전체', () => {
    expect(normalizeBrandSelection({})).toEqual(ALL)
  })
})

describe('예전 링크 주소 → 화면 조건 (v2)', () => {
  const parse = (s: string) => parseDiagnosisQuery(new URLSearchParams(s), 'v2')
  it('brandScope=non_chain&brandUnknown=exclude → 전체, 안내 없이 정리', () => {
    const q = parse('analysisVersion=v2&brandScope=non_chain&brandUnknown=exclude')
    expect(q).toMatchObject(ALL)
    expect(q.brandUrlNotice).toBeUndefined()
  })
  it('brandScope=chain&brandUnknown=include&brandEvidence=confirmed_only → 브랜드·체인', () => {
    expect(
      parse(
        'analysisVersion=v2&brandScope=chain&brandUnknown=include&brandEvidence=confirmed_only',
      ),
    ).toMatchObject(CHAIN)
  })
  it('brandScope=all&brandUnknown=exclude → 전체 (미확인 포함)', () => {
    expect(parse('analysisVersion=v2&brandScope=all&brandUnknown=exclude')).toMatchObject(ALL)
  })
})

describe('brandConditionSummary — 조건 요약은 한 단어', () => {
  it('전체 / 브랜드·체인만 (미확인·판정 근거는 붙이지 않음)', () => {
    expect(brandConditionSummary(ALL)).toBe('전체')
    expect(brandConditionSummary(CHAIN)).toBe('브랜드·체인')
  })
  it('예전 값도 정리한 뒤 한 단어로', () => {
    expect(brandConditionSummary({ brandScope: 'non_chain', brandUnknown: 'exclude' })).toBe('전체')
    expect(
      brandConditionSummary({
        brandScope: 'chain',
        brandUnknown: 'include',
        brandEvidence: 'confirmed_only',
      }),
    ).toBe('브랜드·체인')
  })
})
