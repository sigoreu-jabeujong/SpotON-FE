import type {
  Category,
  FacilitySize,
  FranchiseFilter,
  RadiusMeters,
  SubCategory,
} from '../constants/diagnosis'
import type { DiagnosisQuery } from '../types/diagnosis'
import { brandSelectionFor } from './brands'

/**
 * 결과 화면 "조건 바꾸기" 팝업의 초안 — 주소·좌표·건물 키는 바꾸지 않는다 (다른 주소는 입력 화면에서).
 * 지표 계산이 아니라 URL 조건 ↔ 화면 선택의 변환만 한다.
 */
export type ConditionDraft = {
  category: Category
  subCategories: SubCategory[]
  radius: RadiusMeters
  area: FacilitySize
  /** 기존 가맹 화면(v1)용 */
  franchise: FranchiseFilter
  /** 브랜드·체인 화면(v2)용 — 전체 / 브랜드·체인 두 가지 */
  brandScope: 'all' | 'chain'
  asOf: string | null
}

/** 지금 URL 조건 → 팝업 초안 (카페면 세부 업종 없음) */
export function draftFromQuery(query: DiagnosisQuery): ConditionDraft {
  const category = query.category ?? 'cafe'
  return {
    category,
    subCategories: category === 'restaurant' ? [...query.subCategories] : [],
    radius: query.radius,
    area: query.area,
    franchise: query.franchise,
    brandScope: query.brandScope === 'chain' ? 'chain' : 'all',
    asOf: query.asOf,
  }
}

/** 두 초안이 같은지 (세부 업종은 순서와 상관없이) — 같으면 "다시 조회"를 막는다 */
export function sameDraft(a: ConditionDraft, b: ConditionDraft): boolean {
  return (
    a.category === b.category &&
    a.radius === b.radius &&
    a.area === b.area &&
    a.franchise === b.franchise &&
    a.brandScope === b.brandScope &&
    a.asOf === b.asOf &&
    [...a.subCategories].sort().join(',') === [...b.subCategories].sort().join(',')
  )
}

/**
 * 팝업 초안 → URL 조건 패치 (useDiagnosisQuery.updateQuery에 그대로 넘긴다).
 * - 카페로 바꾸면 세부 업종은 비운다
 * - v2(brandEnabled)는 브랜드 선택 → 요청 세 값(brandSelectionFor), v1은 가맹 필터
 */
export function draftToPatch(
  draft: ConditionDraft,
  brandEnabled: boolean,
): Partial<DiagnosisQuery> {
  return {
    category: draft.category,
    subCategories: draft.category === 'restaurant' ? [...draft.subCategories] : [],
    radius: draft.radius,
    area: draft.area,
    asOf: draft.asOf,
    ...(brandEnabled ? brandSelectionFor(draft.brandScope) : { franchise: draft.franchise }),
  }
}
