import { API_MESSAGES } from '../constants/apiMessages.js'
export type AnalysisApiVersion = 'v1' | 'v2'

export function parseAnalysisVersion(value?: string): AnalysisApiVersion {
  const version = value?.trim() || 'v1'
  if (version !== 'v1' && version !== 'v2') throw new Error(API_MESSAGES.profile)
  return version
}
