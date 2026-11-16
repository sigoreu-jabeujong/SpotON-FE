import { BRAND_API_ENABLED } from '../api/analysisProfile'
import { BRAND_SCOPE_OPTIONS } from '../constants/diagnosis'
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

/** 조건 요약 — 화면 선택 그대로 "전체" 또는 "브랜드·체인" 한 단어 (조건 바·요약 이미지·AI 조건·진단서 공통) */
export function brandConditionSummary(query: BrandSelection): string {
  const q = normalizeBrandSelection(query)
  return BRAND_SCOPE_OPTIONS.find((v) => v.id === q.brandScope)?.label ?? ''
}

/** 브랜드·체인 기준 안내 — 소속 추정 설명 + 자료 상태(준비 전·재검증). 미확인·판정 근거 선택지를 뺐으므로 그 설명은 붙이지 않는다 */
export function brandFilterNotice(meta?: ApiMeta | null): string {
  const T = MESSAGES.brand
  const notes: string[] = [T.membershipLimit]
  if (meta?.brand_classification?.status === 'pending') notes.push(T.pending)
  if (meta?.brand_classification?.source_drift) notes.push(T.drift)
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

/**
 * 예전 링크의 브랜드 조건 → 지금 고를 수 있는 두 가지 중 하나로 정리.
 * 비체인 조건(non_chain)은 전체로, 브랜드·체인이면 미확인 제외·추정 근거 포함으로, 전체면 미확인 포함·추정 근거 포함으로 맞춘다.
 */
export function normalizeBrandSelection(query: BrandSelection) {
  return brandSelectionFor(query.brandScope === 'chain' ? 'chain' : 'all')
}

export const brandMode = BRAND_API_ENABLED
