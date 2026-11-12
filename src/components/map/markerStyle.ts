import type { StoreStatus } from '../../types/stores'

/**
 * 점포 마커 색 (현재 상태 구분). 등급 색이 아니라 상태 구분용이며,
 * 범례·정보창·표에는 항상 글자를 함께 쓴다.
 */
export const MARKER_COLOR: Record<StoreStatus, { dot: string; ring: string }> = {
  open: { dot: 'bg-blue-500', ring: 'ring-blue-500/40' },
  closed: { dot: 'bg-pink-500', ring: 'ring-pink-500/40' },
  other: { dot: 'bg-orange-500', ring: 'ring-orange-500/40' },
}

/** 같은 좌표 묶음 안에 상태가 섞였을 때 (영업 중·폐업 등이 함께) — 상태 색과 구분되는 회색 */
export const MIXED_COLOR = { dot: 'bg-gray-600', ring: 'ring-gray-600/40' } as const
