import { describe, expect, it } from 'vitest'
import { queryKeys } from './queryKeys'
import type { CommonQueryParams } from '../types/api'

const params: CommonQueryParams = {
  lat: 37.55,
  lng: 126.91,
  category: 'cafe',
  radius: 500,
  area: 'all',
  franchise: 'all',
  include_unknown_area: true,
  include_unknown_franchise: true,
}
const history = { building_key: 'test-building', floor_unit: '2층 201호' }
const key = (p = params, h = history, address = '선택한 주소') =>
  queryKeys.riskInterpretation(p, h, address)

describe('해석과 진단서 캐시의 조건 구분', () => {
  it.each([
    { radius: 300 },
    { as_of: '2025-11' },
    { area: 'lt33' },
    { franchise: 'franchise' },
    { include_unknown_area: false },
    { include_unknown_franchise: false },
    { category: 'restaurant', sub_category: ['korean'] },
    { lat: 37.56 },
  ] satisfies Partial<CommonQueryParams>[])(
    '조회 조건 %j가 바뀌면 이전 해석을 재사용하지 않는다',
    (change) => {
      expect(key({ ...params, ...change })).not.toEqual(key())
    },
  )
  it('같은 좌표라도 주소·건물·상세 위치가 다르면 이전 해석을 사용하지 않는다', () => {
    expect(key(params, history, '다른 주소')).not.toEqual(key())
    expect(key(params, { ...history, building_key: 'other-building' })).not.toEqual(key())
    expect(key(params, { ...history, floor_unit: '3층 301호' })).not.toEqual(key())
  })
  it('동일한 조건은 화면과 진단서에서 같은 키를 만든다', () => {
    expect(key({ ...params }, { ...history })).toEqual(key())
    expect(queryKeys.riskInterpretation(params)).toEqual(
      queryKeys.riskInterpretation(params, undefined, ''),
    )
  })
})
