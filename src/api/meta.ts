import type { DataRange, DataRangeParams } from '../types/meta'
import { apiGet } from './client'

/** F-05 시점 선택 가능 범위 (GET /api/meta/data-range) */
export function getDataRange(params: DataRangeParams) {
  return apiGet<DataRange>('/meta/data-range', params)
}
