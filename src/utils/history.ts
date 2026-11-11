import type { HistoryStore } from '../types/stores'

/** 표시 순서만 변경: 최근 개업 순, 날짜 미확인 마지막, 원천·관리번호로 동률 구분. */
export function sortHistory(stores: readonly HistoryStore[]): HistoryStore[] {
  return [...stores].sort((a, b) => {
    if (a.open_date === null && b.open_date !== null) return 1
    if (a.open_date !== null && b.open_date === null) return -1
    return (
      (b.open_date ?? '').localeCompare(a.open_date ?? '') ||
      a.source.localeCompare(b.source) ||
      a.license_no.localeCompare(b.license_no)
    )
  })
}
