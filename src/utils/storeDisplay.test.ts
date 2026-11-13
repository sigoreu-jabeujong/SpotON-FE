import { describe, expect, it } from 'vitest'
import { MESSAGES } from '../constants/messages'
import { historyStore, nearbyMarker } from '../test/fixtures'
import {
  franchiseEmptyMessage,
  franchiseEstimateYear,
  storeCloseDate,
  storeFranchise,
  storeName,
  storeOpenDate,
  storePeriod,
  storePeriodLine,
} from './storeDisplay'

const S = MESSAGES.store

describe('storeName — 상호', () => {
  it('상호가 있으면 그대로', () => {
    expect(storeName({ name: '테스트 식당' })).toEqual({ text: '테스트 식당', missing: false })
  })

  it.each([null, '', '   '])('상호 %j → "정보 없음" (문자열 null·빈칸 금지)', (name) => {
    const r = storeName({ name })
    expect(r).toEqual({ text: S.missingValue, missing: true })
    expect(r.text).not.toMatch(/null/)
  })
})

describe('storeOpenDate — 개업일', () => {
  it('날짜 → YYYY.MM.DD', () => {
    expect(storeOpenDate(historyStore({ open_date: '2020-03-05' })).text).toBe('2020.03.05')
  })

  it('null + 원본 없음 → "정보 없음"', () => {
    const r = storeOpenDate(
      historyStore({ open_date: null, operating_period_reason: 'missing_open_date' }),
    )
    expect(r).toEqual({ text: S.missingValue, missing: true })
  })

  it('null + 무효 → "개업일 확인 필요"', () => {
    const r = storeOpenDate(
      historyStore({ open_date: null, operating_period_reason: 'invalid_open_date' }),
    )
    expect(r).toEqual({ text: S.openDateCheck, missing: true })
  })
})

describe('storeCloseDate — 폐업일', () => {
  it('날짜가 있으면 날짜', () => {
    const r = storeCloseDate(historyStore({ close_date: '2023-12-31' }), 'closed')
    expect(r).toEqual({ text: '2023.12.31', missing: false })
  })

  it('영업 중·기타라 폐업일이 없으면 null ("—" 표시용)', () => {
    expect(storeCloseDate(historyStore({ close_date: null }), 'open')).toBeNull()
    expect(storeCloseDate(historyStore({ close_date: null }), 'other')).toBeNull()
  })

  it.each([
    ['missing_close_date', S.closeDateMissing],
    ['invalid_close_date', S.closeDateCheck],
    ['invalid_date_order', S.dateOrderCheck],
  ] as const)('폐업인데 폐업일 없음 + %s → 사유별 문구', (reason, text) => {
    const r = storeCloseDate(
      historyStore({ close_date: null, operating_period_reason: reason }),
      'closed',
    )
    expect(r).toEqual({ text, missing: true })
  })

  it('폐업인데 폐업일 없음 + 다른 사유 → 원자료가 없었다고 단정하지 않음 ("확인 필요")', () => {
    const r = storeCloseDate(
      historyStore({ close_date: null, operating_period_reason: 'other_status' }),
      'closed',
    )
    expect(r).toEqual({ text: S.closeDateCheck, missing: true })
  })
})

describe('storePeriod — 영업 기간', () => {
  it('0은 실제 "0개월" (정보 없음 아님)', () => {
    const r = storePeriod(historyStore({ operating_months: 0 }))
    expect(r).toEqual({ text: '0개월', missing: false, reason: null })
  })

  it('n년 m개월', () => {
    expect(storePeriod(historyStore({ operating_months: 26 })).text).toBe('2년 2개월')
  })

  it('null(no_data) → "정보 없음" + 사유 문구', () => {
    const r = storePeriod(
      historyStore({
        operating_months: null,
        operating_period_status: 'no_data',
        operating_period_reason: 'other_status',
      }),
    )
    expect(r).toEqual({
      text: S.missingValue,
      missing: true,
      reason: S.periodReasons.other_status,
    })
  })

  it('한 줄 문구: "정보 없음 (사유)", 영문 코드 노출 없음', () => {
    const line = storePeriodLine(
      historyStore({ operating_months: null, operating_period_reason: 'missing_source_date' }),
    )
    expect(line).toBe(`${S.missingValue} (${S.periodReasons.missing_source_date})`)
    expect(line).not.toMatch(/[a-z]+_[a-z]+/)
  })
})

describe('storeFranchise — 프랜차이즈 근거 표시', () => {
  it('목록명 일치 → "프랜차이즈(추정)" + 기준년도·한계 문구', () => {
    const r = storeFranchise(
      nearbyMarker({
        franchise: 'franchise',
        franchise_basis: 'catalog_exact_name',
        franchise_reference_year: 2025,
      }),
    )
    expect(r.kind).toBe('estimate')
    expect(r.label).toBe(S.franchise.estimate)
    expect(r.help).toBe(S.franchise.estimateHelp(2025))
    expect(r.help).toContain('2025년')
  })

  it('기존 외부 분류 → 값 그대로 (자동 일치라고 설명하지 않음)', () => {
    const f = storeFranchise(
      nearbyMarker({ franchise: 'franchise', franchise_basis: 'external_classification' }),
    )
    expect(f).toMatchObject({ kind: 'external', label: S.franchise.external })
    expect(f.help).not.toContain('브랜드 목록')
    const i = storeFranchise(
      nearbyMarker({ franchise: 'independent', franchise_basis: 'external_classification' }),
    )
    expect(i).toMatchObject({ kind: 'external', label: S.franchise.independent })
  })

  it('미확인(unknown) → "정보 없음" (개인 매장으로 바꾸지 않음)', () => {
    const r = storeFranchise(nearbyMarker({ franchise: 'unknown', franchise_basis: null }))
    expect(r).toEqual({ kind: 'unknown', label: S.franchise.unknown, help: null })
    expect(r.label).not.toBe(S.franchise.independent)
  })

  it('표 아래 안내 연도: 추정 행이 있을 때만', () => {
    const est = nearbyMarker({
      franchise: 'franchise',
      franchise_basis: 'catalog_exact_name',
      franchise_reference_year: 2025,
    })
    expect(franchiseEstimateYear([nearbyMarker(), est])).toBe(2025)
    expect(franchiseEstimateYear([nearbyMarker()])).toBeUndefined()
  })

  it('가맹 필터 0건 문구 — 전체면 null(서버 문구 사용)', () => {
    expect(franchiseEmptyMessage('all')).toBeNull()
    expect(franchiseEmptyMessage('franchise')).toBe(S.franchise.emptyFranchise)
    expect(franchiseEmptyMessage('independent')).toBe(S.franchise.emptyIndependent)
  })
})
