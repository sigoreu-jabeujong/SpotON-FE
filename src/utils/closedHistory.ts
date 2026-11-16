import type { DiagnosisQuery } from '../types/diagnosis'
import type { LocationHistoryParams } from '../types/locationHistory'
import type { StoreHistory } from '../types/stores'

export function closedHistoryParams(q: DiagnosisQuery): LocationHistoryParams | null {
  if (
    !q.buildingKey ||
    q.detailUnverified ||
    !q.floorUnit ||
    !/^(?:[1-9]\d{0,2}층|B[1-9]\d{0,2})(?: |$)/.test(q.floorUnit)
  )
    return null
  if (q.historyScope === 'unit' && !q.floorUnit.includes('호')) return null
  return {
    building_key: q.buildingKey,
    floor_unit: q.floorUnit,
    scope: q.historyScope ?? (q.floorUnit.includes('호') ? 'unit' : 'floor'),
    identity_requirement: q.historyIdentity ?? 'address_scope',
    ...(q.category ? { category: q.category } : {}),
  }
}
export function closedHistoryTitle(h?: StoreHistory, failed = false): string {
  if (failed) return '폐업 이력을 불러오지 못했어요'
  const m = h?.location
  if (!h || !m) return '층·호수를 입력해 폐업 이력을 확인해 주세요'
  if (m.result_status === 'pending_identity') return '같은 건물 식별 근거 검증 대기'
  const scope = m.selection.scope === 'unit' ? '층·호수' : '층'
  return `같은 주소 범위·${scope}의 확인된 폐업 이력 ${h.total}건`
}
export function closedHistoryNotice(h?: StoreHistory, failed = false): string {
  if (failed) return '조회 실패를 이력 없음으로 표시하지 않아요. 다시 조회한 뒤 저장해 주세요.'
  if (!h?.location) return '상세 위치가 미확인이면 다른 층의 기록으로 대체하지 않아요.'
  const m = h.location
  if (m.result_status === 'pending_identity')
    return '물리적 건물·동을 확인할 근거가 아직 충분하지 않아요. 주소 범위 참고 조회를 별도로 선택할 수 있어요.'
  const unknown =
    m.location_coverage === 'partial'
      ? ` 상세 위치를 비교하지 못한 폐업 기록 ${m.unresolved_closed_count}건이 있어 이력 부재를 단정할 수 없어요.`
      : ''
  return `지번 주소 범위의 인허가 기록이며 물리적 같은 건물·현재 공실을 확인한 정보는 아니에요.${unknown}`
}
