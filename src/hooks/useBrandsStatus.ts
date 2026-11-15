import { skipToken, useQuery } from '@tanstack/react-query'
import { BRAND_API_ENABLED } from '../api/analysisProfile'
import { apiGet } from '../api/client'
import type { BrandClassification } from '../types/brands'

export function useBrandsStatus() {
  return useQuery({
    queryKey: ['brands', 'status', 'v2'],
    queryFn: BRAND_API_ENABLED ? () => apiGet<BrandClassification>('/v2/brands/status') : skipToken,
    staleTime: 15000,
    refetchOnWindowFocus: true,
    retry: false,
  })
}

/**
 * 브랜드 자료가 정상(로딩·실패·pending·drift가 아님)인지 — 정상일 때만 위쪽 상자에 필터 기준 안내를 합치고
 * 화면 안의 FranchiseFilterNotice는 숨긴다 (같은 제목 상자가 두 번 나오지 않게)
 */
export function useBrandStatusNormal() {
  const status = useBrandsStatus()
  const c = status.data?.data
  return (
    BRAND_API_ENABLED &&
    !status.isError &&
    !status.isPending &&
    c?.status !== 'pending' &&
    !c?.source_drift
  )
}
