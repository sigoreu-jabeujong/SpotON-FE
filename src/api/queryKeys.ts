import type { CommonQueryParams } from '../types/api'
import type { GeocodeParams } from '../types/geocode'
import type { ActivityInclude } from '../types/market'
import type { DataRangeParams } from '../types/meta'
import type { RiskInclude } from '../types/risk'
import type { StoreHistoryParams } from '../types/stores'
import type { SupportLinksParams } from '../types/support'

/** TanStack Query 키. 조건값을 모두 넣어 조건이 바뀌면 새로 요청한다 */
export const queryKeys = {
  geocode: (p: GeocodeParams | null) => ['geocode', p] as const,
  storeHistory: (p: StoreHistoryParams | null) => ['stores', 'history', p] as const,
  nearbyStores: (p: CommonQueryParams | null) => ['stores', 'nearby', p] as const,
  storeSnapshot: (p: CommonQueryParams | null) => ['stores', 'snapshot', p] as const,
  dataRange: (p: DataRangeParams | null) => ['meta', 'data-range', p] as const,
  marketActivity: (p: CommonQueryParams | null, include: ActivityInclude[]) =>
    ['market', 'activity', p, include] as const,
  risk: (p: CommonQueryParams | null, include: RiskInclude[]) => ['risk', p, include] as const,
  supportLinks: (p: SupportLinksParams | null) => ['support-links', p] as const,
}
