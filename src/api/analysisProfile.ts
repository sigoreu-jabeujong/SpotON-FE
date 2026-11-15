import { parseAnalysisVersion } from '../config/analysisVersion'
import type { CommonQueryParams, V2QueryParams } from '../types/api'
import { ApiRequestError } from './client'
import { API_MESSAGES } from '../constants/apiMessages'

export const ANALYSIS_API_VERSION = parseAnalysisVersion(import.meta.env.VITE_ANALYSIS_API_VERSION)
export const BRAND_API_ENABLED = ANALYSIS_API_VERSION === 'v2'
export const analysisPath = (path: string) => (BRAND_API_ENABLED ? `/v2${path}` : path)

export function isBrandQuery(params: CommonQueryParams): params is V2QueryParams {
  return params.brand_scope !== undefined
}

/** Requests cannot cross the profile boundary or mix legacy and brand fields. */
export function validateAnalysisParams(params: CommonQueryParams): void {
  const legacy = ['franchise', 'include_unknown_franchise', 'include_unknown']
  if (
    BRAND_API_ENABLED !== isBrandQuery(params) ||
    (BRAND_API_ENABLED && legacy.some((key) => Object.hasOwn(params, key)))
  )
    throw new ApiRequestError('INVALID_PARAM', API_MESSAGES.analysisParams, null)
}
