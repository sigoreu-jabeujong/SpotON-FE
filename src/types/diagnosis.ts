import type {
  Category,
  FacilitySize,
  FranchiseFilter,
  RadiusMeters,
  SubCategory,
} from '../constants/diagnosis'

/** 사용자가 정한 진단 조건. URL 쿼리로 유지해 새로고침·공유해도 그대로 남는다 */
export type DiagnosisQuery = {
  /** 입력한 주소 원문 (도로명 또는 지번) */
  address: string
  category: Category | null
  subCategories: SubCategory[]
  radius: RadiusMeters
  /** 기준 시점 YYYY-MM. null이면 현재 */
  asOf: string | null
  /** 시설 규모 (단일 선택, 기본 all) */
  area: FacilitySize
  franchise: FranchiseFilter
  /** 면적·프랜차이즈 "정보 없음" 점포 포함 여부 (기본 true) */
  includeUnknown: boolean
}
