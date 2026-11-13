import { describe, expect, it } from 'vitest'
import { INDICATOR_NAME } from '../../../constants/labels'
import { MESSAGES } from '../../../constants/messages'
import { evidenceChip } from './evidenceChip'

describe('evidenceChip — AI 근거 칩 이름·이동', () => {
  it('알려진 지표 ID → 지표 이름 + 그 카드로 이동', () => {
    expect(evidenceChip('competitor_count')).toEqual({
      label: INDICATOR_NAME.competitor_count,
      target: 'competitor_count',
    })
    expect(evidenceChip('survival_rate_1y').label).toBe('개업 1주년 생존율')
  })

  it.each([
    ['recent_open_close', '최근 개폐업 기록'],
    ['avg_operating_months', '평균 경과 기간'],
    ['building_history', '건물 이력'],
    ['same_spot_history', '같은 자리 이력'],
  ])('카드가 없는 근거(상권 활동·이력) %s → "%s", 이동하지 않음', (id, label) => {
    expect(evidenceChip(id)).toEqual({ label, target: null })
  })

  it('이름 표에 없는 새 ID → "기타 근거" (영문 코드 노출 없음), 이동하지 않음', () => {
    const r = evidenceChip('future_new_indicator')
    expect(r).toEqual({ label: MESSAGES.ai.otherEvidence, target: null })
    expect(r.label).not.toMatch(/[a-z_]/)
  })

  it('객체 기본 속성 이름(toString 등)도 지표로 오인하지 않는다', () => {
    expect(evidenceChip('toString')).toEqual({ label: MESSAGES.ai.otherEvidence, target: null })
    expect(evidenceChip('constructor').target).toBeNull()
  })
})
