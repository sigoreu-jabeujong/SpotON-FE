import { BRAND_API_ENABLED } from '../api/analysisProfile'
import {
  BRAND_EVIDENCE_OPTIONS,
  BRAND_SCOPE_OPTIONS,
  BRAND_UNKNOWN_OPTIONS,
} from '../constants/diagnosis'
import { MESSAGES } from '../constants/messages'
import type { ApiMeta } from '../types/api'
import type { DiagnosisQuery } from '../types/diagnosis'

export type BrandSelection = Pick<DiagnosisQuery, 'brandScope' | 'brandUnknown' | 'brandEvidence'>

export function brandSelection(query: BrandSelection) {
  return {
    brandScope: query.brandScope ?? 'all',
    brandUnknown: query.brandUnknown ?? 'include',
    brandEvidence: query.brandEvidence ?? 'include_estimates',
  } as const
}

export function brandConditionSummary(query: BrandSelection): string {
  const q = brandSelection(query)
  return [
    BRAND_SCOPE_OPTIONS.find((v) => v.id === q.brandScope)?.label,
    BRAND_UNKNOWN_OPTIONS.find((v) => v.id === q.brandUnknown)?.label,
    BRAND_EVIDENCE_OPTIONS.find((v) => v.id === q.brandEvidence)?.label,
  ].join(' · ')
}

export function brandFilterNotice(query: BrandSelection, meta?: ApiMeta | null): string {
  const q = brandSelection(query)
  const T = MESSAGES.brand
  const notes: string[] = [T.membershipLimit]
  if (meta?.brand_classification?.status === 'pending') notes.push(T.pending)
  if (meta?.brand_classification?.source_drift) notes.push(T.drift)
  if (q.brandUnknown === 'include') notes.push(T.unknownIncluded)
  if (q.brandScope === 'non_chain') notes.push(T.nonChainLimit)
  if (q.brandEvidence === 'confirmed_only') notes.push(T.confirmedLimit)
  if (q.brandEvidence === 'confirmed_only' && q.brandUnknown === 'include')
    notes.push(T.confirmedUnknown)
  return notes.join(' ')
}

export function brandEmptyMessage(query: BrandSelection): string | null {
  const q = brandSelection(query)
  if (q.brandUnknown === 'include') return null
  return q.brandEvidence === 'confirmed_only' || q.brandScope === 'non_chain'
    ? MESSAGES.brand.emptyConfirmed
    : MESSAGES.brand.emptyExcluded
}

/**
 * 조회 조건 초안에 붙일 안내 문구 키 (MESSAGES.brand의 키) — 없으면 null.
 * 브랜드·체인 + 미확인 포함(기본값)이면 미확인 점포도 함께 나와 결과가 거의 그대로라 알려 준다.
 */
export function brandScopeHint(draft: BrandSelection): 'chainIncludesUnknown' | null {
  const q = brandSelection(draft)
  return q.brandScope === 'chain' && q.brandUnknown === 'include' ? 'chainIncludesUnknown' : null
}

export const brandMode = BRAND_API_ENABLED
