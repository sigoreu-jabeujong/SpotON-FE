import type { CommonQueryParams } from '../types/api'
import type { ActivityInclude } from '../types/market'
import type { DiagnosisQuery } from '../types/diagnosis'
import type { StoreHistoryParams } from '../types/stores'

export type Coordinates = { lat: number; lng: number }

/**
 * 진단 조건(URL 쿼리) + 좌표(/geocode 결과) → 공통 조회 파라미터
 * - 업종이 없으면 null (API를 부르지 않는다)
 * - 음식점에서 세부 업종을 안 골랐으면 sub_category 생략(= 전체), 카페는 항상 생략
 * - 기준 시점이 없으면 as_of 생략(= 현재 월)
 */
export function toCommonQueryParams(
  query: DiagnosisQuery,
  coords: Coordinates,
): CommonQueryParams | null {
  if (!query.category) return null
  const params: CommonQueryParams = {
    lat: coords.lat,
    lng: coords.lng,
    category: query.category,
    radius: query.radius,
    area: query.area,
    franchise: query.franchise,
    include_unknown: query.includeUnknown,
  }
  if (query.category === 'restaurant' && query.subCategories.length > 0) {
    params.sub_category = [...query.subCategories]
  }
  if (query.asOf) params.as_of = query.asOf
  return params
}

/**
 * 진단 조건 → /stores/history 파라미터 (건물 키가 없으면 null)
 * floor_unit은 있을 때만, category는 진단 맥락으로 함께 보낸다 (지원 업종 전체 이력이 올 수 있음)
 */
export function toStoreHistoryParams(query: DiagnosisQuery): StoreHistoryParams | null {
  if (!query.buildingKey) return null
  return {
    building_key: query.buildingKey,
    ...(query.floorUnit ? { floor_unit: query.floorUnit } : {}),
    ...(query.category ? { category: query.category } : {}),
  }
}

/**
 * /market/activity 조건부 항목 — 항상 요청하고, 자료가 없으면 서버가 null + flags.missing으로 알려 준다.
 * 상권 활동 섹션과 AI 해석 요약(context)이 같은 쿼리 키를 쓰도록 한곳에 둔다.
 */
export const ACTIVITY_INCLUDE: ActivityInclude[] = ['sales', 'living_pop']
