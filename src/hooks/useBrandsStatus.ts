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
