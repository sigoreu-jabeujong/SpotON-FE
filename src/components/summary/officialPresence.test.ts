import { describe, expect, it } from 'vitest'
import type { RiskIndicator } from '../../types/risk'
import { hasIndicator, OFFICIAL_IDS, presentOfficialIndicators } from './officialPresence'

const ind = (id: string, type: 'official' | 'reference' = 'official') =>
  ({ id, type, value: null, unit: '%', status: 'pending' }) as unknown as RiskIndicator

describe('공식 지표 유무별 표시 (BE #142 대비)', () => {
  it('두 지표가 오면 지금처럼 고정 순서로 모두 보여준다', () => {
    const list = [
      ind('market_change'),
      ind('closure_rate_12m', 'reference'),
      ind('official_risk'),
      ind('official_closure_rate'),
    ]
    expect(presentOfficialIndicators(list).map((i) => i.id)).toEqual([...OFFICIAL_IDS])
  })

  it('두 지표가 빠지고 market_change만 있으면 그것만 → 영역 유지', () => {
    const list = [ind('closure_rate_12m', 'reference'), ind('market_change')]
    expect(presentOfficialIndicators(list).map((i) => i.id)).toEqual(['market_change'])
  })

  it('공식 지표가 하나도 없으면 빈 목록 → 영역 숨김 (0·정보 없음으로 채우지 않음)', () => {
    expect(presentOfficialIndicators([ind('closure_rate_12m', 'reference')])).toEqual([])
    expect(presentOfficialIndicators([])).toEqual([])
    expect(presentOfficialIndicators(null)).toEqual([])
  })

  it('요약 이미지 칸 판단: 응답에 있는 지표인지', () => {
    expect(hasIndicator([ind('official_closure_rate')], 'official_closure_rate')).toBe(true)
    expect(hasIndicator([ind('market_change')], 'official_closure_rate')).toBe(false)
    expect(hasIndicator(undefined, 'official_closure_rate')).toBe(false)
  })
})
