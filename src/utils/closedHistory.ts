import type { DiagnosisQuery } from '../types/diagnosis'
import type { LocationHistoryParams } from '../types/locationHistory'
import type { StoreHistory } from '../types/stores'

export function closedHistoryParams(q: DiagnosisQuery): LocationHistoryParams | null {
  if (
    !q.buildingKey ||
    !q.address ||
    !q.category ||
    q.lat === null ||
    q.lng === null ||
    q.detailUnverified ||
    (!!q.floorUnit && !/^(?:[1-9]\d{0,2}층|B[1-9]\d{0,2})(?: |$)/.test(q.floorUnit))
  )
    return null
  return {
    building_key: q.buildingKey,
    address: q.address,
    lat: q.lat,
    lng: q.lng,
    ...(q.floorUnit ? { floor_unit: q.floorUnit } : {}),
    scope: !q.floorUnit ? 'address' : q.floorUnit.includes('호') ? 'unit' : 'floor',
    identity_requirement: 'address_scope',
    category: q.category,
  }
}
export function closedHistoryTitle(h?: StoreHistory, failed = false): string {
  if (failed) return '점포 이력을 불러오지 못했어요'
  const m = h?.location
  if (!h || !m) return '주소를 확인해 점포 이력을 조회해 주세요'
  if (m.result_status === 'pending_identity') return '같은 건물 식별 근거 검증 대기'
  return '점포 이력'
}
export function closedHistoryNotice(h?: StoreHistory, failed = false): string {
  if (failed) return '조회 실패를 이력 없음으로 표시하지 않아요. 다시 조회한 뒤 저장해 주세요.'
  if (!h?.location) return '상세 위치가 미확인이면 다른 층의 기록으로 대체하지 않아요.'
  const m = h.location
  if (m.result_status === 'pending_identity') return '주소를 확인한 뒤 다시 조회해 주세요.'
  if (h.total === 0 && m.location_coverage === 'partial')
    return '상세 위치가 확인되지 않은 기록은 제외했어요.'
  return ''
}
