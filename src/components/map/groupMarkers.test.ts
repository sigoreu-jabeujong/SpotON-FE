import { describe, expect, it } from 'vitest'
import { nearbyMarker } from '../../test/fixtures'
import { storeKey } from '../../utils/storeKey'
import { coordKey, findGroupOf, groupMarkers } from './groupMarkers'

describe('groupMarkers — 같은 좌표 점포 묶음', () => {
  it('좌표가 완전히 같을 때만 묶는다', () => {
    const groups = groupMarkers([
      nearbyMarker({ license_no: 'A', lat: 37.5515, lng: 126.9139 }),
      nearbyMarker({ license_no: 'B', lat: 37.5515, lng: 126.9139 }),
      nearbyMarker({ license_no: 'C', lat: 37.5516, lng: 126.9139 }),
    ])
    expect(groups.map((g) => g.stores.map((s) => s.license_no))).toEqual([['A', 'B'], ['C']])
  })

  it('반올림하지 않는다 (아주 작은 차이도 다른 자리)', () => {
    const groups = groupMarkers([
      nearbyMarker({ license_no: 'A', lat: 37.551500001, lng: 126.9139 }),
      nearbyMarker({ license_no: 'B', lat: 37.5515, lng: 126.9139 }),
    ])
    expect(groups).toHaveLength(2)
    // 묶음 좌표도 응답 값 그대로
    expect(groups[0].lat).toBe(37.551500001)
  })

  it('서버 순서(가까운 순)를 지킨다', () => {
    const groups = groupMarkers([
      nearbyMarker({ license_no: 'near', lat: 1, lng: 1 }),
      nearbyMarker({ license_no: 'far', lat: 2, lng: 2 }),
      nearbyMarker({ license_no: 'near2', lat: 1, lng: 1 }),
    ])
    expect(groups.map((g) => g.key)).toEqual([
      coordKey({ lat: 1, lng: 1 }),
      coordKey({ lat: 2, lng: 2 }),
    ])
    expect(groups[0].stores.map((s) => s.license_no)).toEqual(['near', 'near2'])
  })

  it('상태가 같으면 그 상태, 섞이면 mixed', () => {
    const same = groupMarkers([
      nearbyMarker({ license_no: 'A', current_status: 'closed' }),
      nearbyMarker({ license_no: 'B', current_status: 'closed' }),
    ])
    expect(same[0].status).toBe('closed')
    const mixed = groupMarkers([
      nearbyMarker({ license_no: 'A', current_status: 'open' }),
      nearbyMarker({ license_no: 'B', current_status: 'closed' }),
    ])
    expect(mixed[0].status).toBe('mixed')
  })

  it('같은 관리번호·다른 원천은 같은 좌표에서도 두 점포로 남고, 각각 찾을 수 있다', () => {
    const a = nearbyMarker({ source: 'rest_cafe', license_no: 'SAME' })
    const b = nearbyMarker({ source: 'general_restaurant', license_no: 'SAME' })
    const groups = groupMarkers([a, b])
    expect(groups[0].stores).toHaveLength(2)
    expect(findGroupOf(groups, storeKey('general_restaurant', 'SAME'))).toBe(groups[0])
    expect(findGroupOf(groups, storeKey('rest_cafe', 'OTHER'))).toBeNull()
    expect(findGroupOf(groups, null)).toBeNull()
  })

  it('빈 목록 → 빈 묶음', () => {
    expect(groupMarkers([])).toEqual([])
  })
})
