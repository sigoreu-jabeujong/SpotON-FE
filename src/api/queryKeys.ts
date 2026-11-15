import type { CommonQueryParams } from '../types/api'
import type { ActivityInclude } from '../types/market'
import type { DataRangeParams } from '../types/meta'
import type { RiskInclude, RiskInterpretHistory } from '../types/risk'
import type { StoreHistoryParams } from '../types/stores'
import type { SupportLinksParams } from '../types/support'
import type { ApiMeta } from '../types/api'
import { ANALYSIS_API_VERSION } from './analysisProfile'
import { riskBaseline } from './interpretationContext'

/** TanStack Query 키. 조건값을 모두 넣어 조건이 바뀌면 새로 요청한다 */
export const queryKeys = {
  storeHistory: (p: StoreHistoryParams | null) =>
    ['stores', 'history', ANALYSIS_API_VERSION, p] as const,
  nearbyStores: (p: CommonQueryParams | null) =>
    ['stores', 'nearby', ANALYSIS_API_VERSION, p] as const,
  storeSnapshot: (p: CommonQueryParams | null) =>
    ['stores', 'snapshot', ANALYSIS_API_VERSION, p] as const,
  dataRange: (p: DataRangeParams | null) => ['meta', 'data-range', p] as const,
  marketActivity: (p: CommonQueryParams | null, include: ActivityInclude[]) =>
    ['market', 'activity', ANALYSIS_API_VERSION, p, include] as const,
  risk: (p: CommonQueryParams | null, include: RiskInclude[]) =>
    ['risk', ANALYSIS_API_VERSION, p, include] as const,
  /** 받아 둔 AI 해석 (요청하지 않고 저장만 — 진단서·요약 이미지에서 다시 쓴다) */
  riskInterpretation: (
    p: CommonQueryParams | null,
    history?: RiskInterpretHistory,
    address = '',
    baseline?: ApiMeta | null,
  ) =>
    [
      'risk',
      'interpret',
      'narrative-v1',
      ANALYSIS_API_VERSION,
      p,
      history ?? null,
      address,
      ANALYSIS_API_VERSION === 'v2' ? riskBaseline(baseline) : null,
    ] as const,
  supportLinks: (p: SupportLinksParams | null) => ['support-links', p] as const,
}
