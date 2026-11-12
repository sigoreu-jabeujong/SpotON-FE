import type { Category, SubCategory } from '../constants/diagnosis'

/**
 * GET /api/meta/data-range 요청 — 주변 조회와 같은 업종 조건 (BE docs/fe-data-range-api-request.md).
 * 세부 업종은 음식점에서 고른 경우만 보낸다 (카페·전체는 생략)
 */
export type DataRangeParams = { category: Category; sub_category?: SubCategory[] }

/** GET /api/meta/data-range 응답 data — 시점 선택 가능 범위 (다섯 키는 항상 있음) */
export type DataRange = {
  /** YYYY-MM. 유효 표본이 없으면 null — 과거 월·빠른 선택을 막고 임의로 채우지 않는다 */
  min_month: string | null
  /** YYYY-MM (원천 갱신일의 월 — 브라우저 현재 월로 대신하지 않음) */
  max_month: string
  /** 최신 월을 고를 때의 실제 기준일 YYYY-MM-DD (월말이 아님) */
  max_date: string
  data_updated_at: string | null
  collected_at: string | null
}
