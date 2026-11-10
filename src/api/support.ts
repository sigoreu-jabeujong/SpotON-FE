import type { SupportLinks, SupportLinksParams } from '../types/support'
import { apiGet } from './client'

/** F-10 상담·지원 링크 (GET /api/support-links) */
export function getSupportLinks(params: SupportLinksParams = {}) {
  return apiGet<SupportLinks>('/support-links', params)
}
