/** GET /api/meta/data-range 목업 — 시연용 가상 값 */
import type { DataRange } from '../../types/meta'
import { ok } from './common'
import type { MockHandler } from './index'

/** PDF 예시는 1960-01이지만, 화면 확인이 쉽도록 2010-01로 둠 (시연용) */
export const DATA_RANGE: DataRange = {
  min_month: '2010-01',
  max_month: '2026-11',
  data_updated_at: '2026-11-08',
  collected_at: '2026-11-09',
}

export const dataRangeMock: MockHandler = () => ok(DATA_RANGE, {})
