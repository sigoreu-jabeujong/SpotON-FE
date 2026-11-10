import type { Category } from '../constants/diagnosis'

/** GET /api/meta/data-range 요청 */
export type DataRangeParams = { category: Category }

/** GET /api/meta/data-range 응답 data — 시점 선택 가능 범위 */
export type DataRange = {
  /** YYYY-MM */
  min_month: string
  /** YYYY-MM */
  max_month: string
  data_updated_at: string | null
  collected_at: string | null
}
