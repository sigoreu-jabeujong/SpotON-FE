import type { HistoryStore } from '../types/stores'

export function locationRelationLabel(store: HistoryStore): string {
  if (store.history_scope === 'unit') return '입력한 주소·층·호수 일치'
  if (store.history_scope === 'floor') return '입력한 주소·층 일치'
  if (store.history_scope === 'address') return '입력한 주소 범위'
  switch (store.location_relation?.relation_level) {
    case 'same_spot':
      return '같은 주소 범위·층·호수 일치'
    case 'same_floor':
      return '같은 주소 범위·층 일치 (자리 미확인)'
    case 'same_building_scope':
      return '같은 주소 범위 (층·자리 일치 미확인)'
    default:
      return '상세 위치 미확인'
  }
}
