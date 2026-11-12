import type { NearbyMarker, StoreStatus } from '../../types/stores'
import { storeKey } from '../../utils/storeKey'

/**
 * 같은 좌표 점포 묶음 — 지도에서 보이는 방식만 바꾼다 (표·"조건에 맞는 점포 N곳"은 그대로).
 * 좌표는 응답 값 그대로 비교한다 (반올림·보정으로 위치를 바꾸지 않음).
 */
export type MarkerGroup = {
  /** 좌표 문자열 "lat,lng" (응답 값 그대로) */
  key: string
  lat: number
  lng: number
  /** 서버 순서(가까운 순) 그대로 */
  stores: NearbyMarker[]
  /** 묶음 안 상태가 모두 같으면 그 상태, 섞이면 'mixed' (마커 색·범례용) */
  status: StoreStatus | 'mixed'
}

/** 이 개수보다 묶음(마커)이 많으면 카카오 clusterer로 가까운 마커를 합쳐 그린다 (perf, PR 측정값 참고) */
export const CLUSTER_MIN_GROUPS = 300

export const coordKey = (m: Pick<NearbyMarker, 'lat' | 'lng'>) => `${m.lat},${m.lng}`

/** 응답 순서를 지키며 같은 좌표끼리 묶는다 */
export function groupMarkers(markers: readonly NearbyMarker[]): MarkerGroup[] {
  const byKey = new Map<string, MarkerGroup>()
  for (const m of markers) {
    const key = coordKey(m)
    const g = byKey.get(key)
    if (g) {
      g.stores.push(m)
      if (g.status !== m.current_status) g.status = 'mixed'
    } else {
      byKey.set(key, { key, lat: m.lat, lng: m.lng, stores: [m], status: m.current_status })
    }
  }
  return [...byKey.values()]
}

/** 점포 식별값(storeKey)이 들어 있는 묶음 */
export function findGroupOf(groups: readonly MarkerGroup[], id: string | null) {
  if (!id) return null
  return groups.find((g) => g.stores.some((s) => storeKey(s.source, s.license_no) === id)) ?? null
}
