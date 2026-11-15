/**
 * 점포 이력 표·출력용 진단서가 함께 쓰는 정렬 규칙 (두 화면이 같은 순서를 쓰도록 한 곳에).
 * 결측 표시("정보 없음"·사유)는 주변 점포·시점 조회와 같이 utils/storeDisplay를 쓴다.
 */
import type { HistoryStore } from '../types/stores'

/**
 * 최근 개업 순 (표시 순서만 바꿈). 개업일 미확인은 맨 뒤, 같은 날짜는 source → license_no 순으로 고정.
 * API·React Query 캐시 배열은 건드리지 않고 복사본을 정렬한다.
 */
export function sortHistoryRecentFirst(stores: readonly HistoryStore[]): HistoryStore[] {
  return [...stores].sort((a, b) => {
    if (a.open_date !== b.open_date) {
      if (a.open_date === null) return 1
      if (b.open_date === null) return -1
      return a.open_date < b.open_date ? 1 : -1
    }
    if (a.source !== b.source) return a.source < b.source ? -1 : 1
    if (a.license_no !== b.license_no) return a.license_no < b.license_no ? -1 : 1
    return 0
  })
}
