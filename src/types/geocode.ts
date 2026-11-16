import type { Category } from '../constants/diagnosis'

/** GET /api/geocode 요청 */
export type GeocodeParams = {
  /** 도로명 또는 지번 주소 (층·호실 포함 가능) */
  query: string
  category: Category
}

/** 주소 검색 결과 1건 */
export type GeocodeCandidate = {
  address_road: string
  address_jibun: string
  lat: number
  lng: number
  category: Category
  is_seoul: boolean
  sigungu: string
  /** 지번 기준 건물 키 {자치구}-{법정동}-{본번}-{부번} */
  building_key: string
  /** 층·호실. 추출 못 하면 null */
  floor_unit: string | null
}

/** GET /api/geocode 응답 data */
export type GeocodeResult = GeocodeCandidate & {
  /** 여러 후보(최대 5건). 입력 주소와 유일하게 일치하면 자동 선택한다. */
  candidates: GeocodeCandidate[]
}
