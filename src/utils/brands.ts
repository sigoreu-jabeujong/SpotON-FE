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
 * 화면 선택(전체 / 브랜드·체인) → 요청 조건 세 값 (지표 계산이 아니라 조회 조건 매핑).
 * - 전체: 미확인 포함·추정 근거 포함 (기본값과 같음)
 * - 브랜드·체인: 미확인 제외·추정 근거 포함 → 브랜드·체인(추정) 점포만
 */
export function brandSelectionFor(scope: 'all' | 'chain') {
  return scope === 'chain'
    ? ({
        brandScope: 'chain',
        brandUnknown: 'exclude',
        brandEvidence: 'include_estimates',
      } as const)
    : ({ brandScope: 'all', brandUnknown: 'include', brandEvidence: 'include_estimates' } as const)
}

export const brandMode = BRAND_API_ENABLED
