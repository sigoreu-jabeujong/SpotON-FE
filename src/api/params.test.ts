import { describe, expect, it } from 'vitest'
import type { DiagnosisQuery } from '../types/diagnosis'
import type { RiskInterpretRequest } from '../types/risk'
import {
  toCommonQueryParams,
  toDataRangeParams,
  toInterpretHistory,
  toRiskInterpretRequest,
  toStoreHistoryParams,
} from './params'

const coords = { lat: 37.5515, lng: 126.9139 }

function query(over: Partial<DiagnosisQuery> = {}): DiagnosisQuery {
  return {
    address: '서울특별시 마포구 테스트로 1',
    category: 'cafe',
    subCategories: [],
    radius: 500,
    asOf: null,
    area: 'all',
    franchise: 'all',
    includeUnknown: true,
    lat: coords.lat,
    lng: coords.lng,
    buildingKey: '마포구-테스트동-1-0',
    floorUnit: '2층',
    sigungu: '마포구',
    ...over,
  }
}

describe('toCommonQueryParams — 정보 없음 포함 플래그', () => {
  it('legacy include_unknown은 보내지 않고 면적·가맹을 따로', () => {
    const p = toCommonQueryParams(query(), coords)
    expect(p).not.toHaveProperty('include_unknown')
    expect(p).toMatchObject({ include_unknown_area: true, include_unknown_franchise: true })
  })

  it('가맹 필터 "전체"면 체크박스 값을 그대로', () => {
    const p = toCommonQueryParams(query({ includeUnknown: false }), coords)
    expect(p).toMatchObject({ include_unknown_area: false, include_unknown_franchise: false })
  })

  it.each(['franchise', 'independent'] as const)(
    '가맹 필터 %s → include_unknown_franchise=false (면적은 체크박스 그대로)',
    (franchise) => {
      const p = toCommonQueryParams(query({ franchise, includeUnknown: true }), coords)
      expect(p).toMatchObject({
        franchise,
        include_unknown_area: true,
        include_unknown_franchise: false,
      })
    },
  )
})

describe('toCommonQueryParams — 빈 값 생략', () => {
  it('업종이 없으면 null (API를 부르지 않음)', () => {
    expect(toCommonQueryParams(query({ category: null }), coords)).toBeNull()
  })

  it('기준 시점이 없으면 as_of 생략, 있으면 YYYY-MM 그대로', () => {
    expect(toCommonQueryParams(query(), coords)).not.toHaveProperty('as_of')
    expect(toCommonQueryParams(query({ asOf: '2023-10' }), coords)).toMatchObject({
      as_of: '2023-10',
    })
  })

  it('세부 업종: 카페는 항상 생략, 음식점은 골랐을 때만', () => {
    expect(toCommonQueryParams(query({ subCategories: ['korean'] }), coords)).not.toHaveProperty(
      'sub_category',
    )
    expect(toCommonQueryParams(query({ category: 'restaurant' }), coords)).not.toHaveProperty(
      'sub_category',
    )
    expect(
      toCommonQueryParams(query({ category: 'restaurant', subCategories: ['korean'] }), coords),
    ).toMatchObject({ sub_category: ['korean'] })
  })
})

describe('AI 해석 요청 본문 — query는 조회 조건만, 이력 문맥은 history 키로만 (BE #98)', () => {
  // AiInterpretation은 toRiskInterpretRequest(Risk GET과 같은 조회 조건, URL의 bk·floor)로 본문을 만든다
  const q = query({ asOf: '2023-10' })
  const body: RiskInterpretRequest = toRiskInterpretRequest(
    toCommonQueryParams(q, coords)!,
    toInterpretHistory(q),
  )

  it('최상위 키는 query와 history뿐', () => {
    expect(Object.keys(body).sort()).toEqual(['history', 'query'])
  })

  it('query 안에는 주소·건물 키·층·자치구·화면 수치가 들어가지 않는다', () => {
    const keys = Object.keys(body.query)
    for (const k of [
      'address',
      'building_key',
      'buildingKey',
      'floor_unit',
      'floorUnit',
      'sigungu',
      'gu',
      'market',
      'indicators',
      'flags',
      'radius_m',
      'filters',
      'include_unknown',
      'history',
    ])
      expect(keys).not.toContain(k)
    expect(JSON.stringify(body.query)).not.toContain('마포구-테스트동')
    expect(JSON.stringify(body)).not.toContain('테스트로')
  })

  it('query에 보내는 키는 조회 조건만', () => {
    const allowed = [
      'lat',
      'lng',
      'category',
      'radius',
      'sub_category',
      'as_of',
      'area',
      'franchise',
      'include_unknown_area',
      'include_unknown_franchise',
    ]
    for (const k of Object.keys(body.query)) expect(allowed).toContain(k)
  })

  it('건물 키·층은 history에만, 다른 필드 없음', () => {
    expect(body.history).toEqual({ building_key: '마포구-테스트동-1-0', floor_unit: '2층' })
  })
})

describe('toInterpretHistory — 선택 이력 문맥', () => {
  it('건물 키가 없으면 history 생략', () => {
    expect(toInterpretHistory(query({ buildingKey: null }))).toBeUndefined()
    expect(toInterpretHistory(query({ buildingKey: '  ' }))).toBeUndefined()
    const params = toCommonQueryParams(query({ buildingKey: null }), coords)!
    expect(Object.keys(toRiskInterpretRequest(params, undefined))).toEqual(['query'])
  })

  it.each([null, '', '   '])('층 %j → floor_unit null (빈 문자열을 보내지 않음)', (floorUnit) => {
    expect(toInterpretHistory(query({ floorUnit }))).toEqual({
      building_key: '마포구-테스트동-1-0',
      floor_unit: null,
    })
  })

  it('URL 값 그대로 (앞뒤 공백만 정리)', () => {
    expect(
      toInterpretHistory(query({ buildingKey: ' 중구-명동2가-83-5 ', floorUnit: 'B1' })),
    ).toEqual({
      building_key: '중구-명동2가-83-5',
      floor_unit: 'B1',
    })
  })
})

describe('기타 파라미터', () => {
  it('data-range: 음식점 세부 업종만 함께, 좌표·반경은 보내지 않음', () => {
    expect(toDataRangeParams(query())).toEqual({ category: 'cafe' })
    expect(
      toDataRangeParams(query({ category: 'restaurant', subCategories: ['korean', 'chinese'] })),
    ).toEqual({ category: 'restaurant', sub_category: ['korean', 'chinese'] })
    expect(toDataRangeParams(query({ category: null }))).toBeNull()
  })

  it('이력: 건물 키 없으면 null, 층은 있을 때만', () => {
    expect(toStoreHistoryParams(query({ buildingKey: null }))).toBeNull()
    expect(toStoreHistoryParams(query({ floorUnit: null }))).not.toHaveProperty('floor_unit')
    expect(toStoreHistoryParams(query())).toMatchObject({
      building_key: '마포구-테스트동-1-0',
      floor_unit: '2층',
    })
  })
})
