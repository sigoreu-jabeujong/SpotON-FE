import { describe, expect, it } from 'vitest'
import { checklistItems, reportChecklistLine } from './checklist'

describe('AI 계약 전 확인사항 (체크리스트)', () => {
  it('서버가 보낸 항목을 순서·글자 그대로 쓴다', () => {
    const checklist = [
      { item: '이전 점포의 폐업 사유 확인', why: '이력 일부 미확인' },
      { item: '현장 유동 인구 관찰', why: '생활인구 자료 없음' },
    ]
    expect(checklistItems({ checklist })).toEqual(checklist)
  })

  it('배열이 없거나 비어 있으면 빈 목록 → 블록을 숨긴다', () => {
    expect(checklistItems({ checklist: [] })).toEqual([])
    expect(checklistItems(null)).toEqual([])
    expect(checklistItems(undefined)).toEqual([])
    expect(
      checklistItems({ checklist: undefined as unknown as { item: string; why: string }[] }),
    ).toEqual([])
  })

  it('항목 글자가 빈 줄은 뺀다', () => {
    expect(
      checklistItems({
        checklist: [
          { item: '  ', why: 'x' },
          { item: '건물주에게 확인', why: '' },
        ],
      }),
    ).toEqual([{ item: '건물주에게 확인', why: '' }])
  })

  it('진단서 한 줄은 "□ 항목 (이유)", 이유가 없으면 "□ 항목"', () => {
    expect(reportChecklistLine({ item: '현장 관찰', why: '생활인구 자료 없음' })).toBe(
      '□ 현장 관찰 (생활인구 자료 없음)',
    )
    expect(reportChecklistLine({ item: '현장 관찰', why: ' ' })).toBe('□ 현장 관찰')
  })
})
