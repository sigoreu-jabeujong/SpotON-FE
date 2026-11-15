import { describe, expect, it } from 'vitest'
import { MESSAGES } from '../constants/messages'
import { brandScopeHint } from './brands'

describe('brandScopeHint — 브랜드·체인 선택 시 미확인 포함 안내', () => {
  it('브랜드·체인 + 미확인 포함이면 안내 키', () => {
    expect(brandScopeHint({ brandScope: 'chain', brandUnknown: 'include' })).toBe(
      'chainIncludesUnknown',
    )
  })

  it('미확인 기본값(포함)도 같은 안내', () => {
    expect(brandScopeHint({ brandScope: 'chain' })).toBe('chainIncludesUnknown')
  })

  it('미확인 제외면 안내 없음', () => {
    expect(brandScopeHint({ brandScope: 'chain', brandUnknown: 'exclude' })).toBeNull()
  })

  it('브랜드 소속이 전체·비체인 조건이면 안내 없음', () => {
    expect(brandScopeHint({ brandScope: 'all', brandUnknown: 'include' })).toBeNull()
    expect(brandScopeHint({ brandScope: 'non_chain', brandUnknown: 'include' })).toBeNull()
    expect(brandScopeHint({})).toBeNull()
  })

  it('판정 근거와 상관없이 같은 판단', () => {
    expect(
      brandScopeHint({
        brandScope: 'chain',
        brandUnknown: 'include',
        brandEvidence: 'confirmed_only',
      }),
    ).toBe('chainIncludesUnknown')
  })

  it('안내 문구는 미확인을 개인 매장·비체인으로 부르지 않는다', () => {
    const text = MESSAGES.brand.chainIncludesUnknown + MESSAGES.brand.chainExcludeUnknownAction
    expect(text).not.toMatch(/개인 매장|비체인/)
  })
})
