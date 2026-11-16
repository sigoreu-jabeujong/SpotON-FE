/**
 * 점포 표 정렬 — 화면에서 순서만 바꾼다 (새 지표 계산 아님, 서버가 준 operating_months 그대로).
 */

/** 점포 상세 조회 표 정렬: 가까운 순(서버 순서 그대로) / 영업 기간 순 */
export type StoreSort = 'nearest' | 'period'

/**
 * 영업 기간이 긴 점포부터. 영업 기간이 없는(null) 점포는 맨 뒤.
 * 같은 기간끼리는 원래(서버) 순서를 유지한다. 원래 배열은 바꾸지 않는다.
 */
export function sortByOperatingPeriod<T extends { operating_months: number | null }>(
  stores: readonly T[],
): T[] {
  return stores
    .map((store, index) => ({ store, index }))
    .sort((a, b) => {
      const x = a.store.operating_months
      const y = b.store.operating_months
      if (x === null && y === null) return a.index - b.index
      if (x === null) return 1
      if (y === null) return -1
      return y - x || a.index - b.index
    })
    .map(({ store }) => store)
}

/** 정렬 기준에 맞춘 목록 — 가까운 순은 받은 배열 그대로 */
export function sortStores<T extends { operating_months: number | null }>(
  stores: readonly T[],
  sort: StoreSort,
): readonly T[] {
  return sort === 'period' ? sortByOperatingPeriod(stores) : stores
}
