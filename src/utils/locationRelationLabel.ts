import type { HistoryStore } from '../types/stores'

export function locationRelationLabel(store: HistoryStore): string {
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
