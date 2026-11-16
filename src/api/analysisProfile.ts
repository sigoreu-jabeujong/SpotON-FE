import { parseAnalysisVersion } from '../config/analysisVersion'
import type { CommonQueryParams } from '../types/api'
import { ApiRequestError } from './client'
import { API_MESSAGES } from '../constants/apiMessages'

export const ANALYSIS_API_VERSION = parseAnalysisVersion(import.meta.env.VITE_ANALYSIS_API_VERSION)
export const V2_API_ENABLED = ANALYSIS_API_VERSION === 'v2'
export const analysisPath = (path: string) => (V2_API_ENABLED ? `/v2${path}` : path)

export function validateAnalysisParams(params: CommonQueryParams): void {
  const removed = [
    'franchise',
    'include_unknown_franchise',
    'brand_scope',
    'brand_unknown',
    'brand_evidence',
    'brand_time_basis',
    'operation_type',
  ]
  if (removed.some((key) => Object.hasOwn(params, key)))
    throw new ApiRequestError('INVALID_PARAM', API_MESSAGES.analysisParams, null)
}
