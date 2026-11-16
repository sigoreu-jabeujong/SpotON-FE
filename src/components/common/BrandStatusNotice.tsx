import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState, useSyncExternalStore, type ReactNode } from 'react'
import { BRAND_API_ENABLED } from '../../api/analysisProfile'
import { MESSAGES } from '../../constants/messages'
import { useBrandStatusNormal, useBrandsStatus } from '../../hooks/useBrandsStatus'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import type { ApiResult } from '../../api/client'
import type { ApiMeta } from '../../types/api'
import InfoBox from './InfoBox'
import { brandFilterNotice } from '../../utils/brands'

function stamp(meta?: ApiMeta | null) {
  const c = meta?.brand_classification
  return c ? JSON.stringify([c.generation, c.status, c.source_drift]) : null
}

/** Never combine actively displayed responses from different public generations. */
export function BrandResultBoundary({ children }: { children: ReactNode }) {
  const client = useQueryClient()
  const status = useBrandsStatus()
  const [blocked, setBlocked] = useState(false)
  const subscribe = useCallback(
    (change: () => void) => client.getQueryCache().subscribe(change),
    [client],
  )
  const snapshot = useCallback(
    () =>
      [
        ...new Set(
          client
            .getQueryCache()
            .getAll()
            .filter(
              (q) =>
                q.getObserversCount() > 0 &&
                q.queryKey.includes('v2') &&
                q.queryKey[0] !== 'brands',
            )
            .map((q) => stamp((q.state.data as ApiResult<unknown> | undefined)?.meta))
            .filter((v): v is string => v !== null),
        ),
      ]
        .sort()
        .join('|'),
    [client],
  )
  const observed = useSyncExternalStore(subscribe, snapshot, () => '')
  const stamps = new Set(observed ? observed.split('|') : [])
  if (status.data)
    stamps.add(
      JSON.stringify([
        status.data.data.generation,
        status.data.data.status,
        status.data.data.source_drift,
      ]),
    )
  const mismatch = BRAND_API_ENABLED && stamps.size > 1
  if (mismatch && !blocked) setBlocked(true)
  if (BRAND_API_ENABLED && (blocked || mismatch))
    return (
      <InfoBox
        showTitle
        title={MESSAGES.brand.title}
        description={MESSAGES.brand.generationMismatch}
      >
        <button
          type="button"
          className="mt-2 min-h-11 underline"
          onClick={() => window.location.reload()}
        >
          {MESSAGES.brand.reload}
        </button>
      </InfoBox>
    )
  return children
}

export default function BrandStatusNotice({
  withFilterNotice = false,
}: {
  /** 필터 기준 안내(FranchiseFilterNotice)가 있는 화면(STEP 02·03) — 정상 상태면 이 상자에 이어서 보여 준다 */
  withFilterNotice?: boolean
}) {
  const status = useBrandsStatus()
  const normal = useBrandStatusNormal()
  const { query } = useDiagnosisQuery()
  if (!BRAND_API_ENABLED) return null
  const c = status.data?.data
  const T = MESSAGES.brand
  return (
    <div className="mb-5 space-y-3">
      {query.brandUrlNotice === 'invalid_brand' && (
        <InfoBox title={T.title} description={T.invalidUrl} />
      )}
      {query.brandUrlNotice === 'mixed_legacy' && (
        <InfoBox title={T.title} description={T.mixedLegacy} />
      )}
      <InfoBox
        showTitle
        title={T.title}
        description={
          status.isError
            ? T.statusFailed
            : status.isPending
              ? T.statusLoading
              : c?.status === 'pending'
                ? T.pending
                : c?.source_drift
                  ? T.drift
                  : T.observation
        }
      >
        {withFilterNotice && normal && <p className="mt-1">{brandFilterNotice(query)}</p>}
      </InfoBox>
    </div>
  )
}
