/** GET /api/geocode 목업 — 시연용 가상 값 */
import type { Category } from '../../constants/diagnosis'
import type { GeocodeCandidate, GeocodeResult } from '../../types/geocode'
import { fail, ok } from './common'
import type { MockHandler } from './index'

/** 오류 화면 확인용: 이 단어가 주소에 있으면 서울 외 지역으로 응답 */
const NON_SEOUL = [
  '경기',
  '인천',
  '부산',
  '대구',
  '대전',
  '광주',
  '울산',
  '세종시', // '세종'만 쓰면 서울 세종대로와 겹침
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
]

const base = (category: Category): GeocodeCandidate => ({
  address_road: '서울특별시 마포구 ○○로 12',
  address_jibun: '서울특별시 마포구 ○○동 123-4',
  lat: 37.5563,
  lng: 126.922,
  category,
  is_seoul: true,
  sigungu: '마포구',
  building_key: '마포구-○○동-123-4',
  floor_unit: '1층',
})

/**
 * 테스트용 입력 규칙
 * - "없는" 포함 → 404 ADDRESS_NOT_FOUND
 * - 서울 외 지역명 포함 → 422 OUT_OF_SEOUL
 * - "여러" 포함 → 후보(candidates) 2건
 */
export const geocodeMock: MockHandler = (query) => {
  const q = (query.get('query') ?? '').trim()
  const category = query.get('category')
  if (!q) return fail(400, 'INVALID_PARAM', '입력값을 다시 확인해 주세요.')
  if (category !== 'cafe' && category !== 'restaurant')
    return fail(400, 'CATEGORY_REQUIRED', '카페 또는 음식점을 선택해 주세요.')
  if (q.includes('없는'))
    return fail(
      404,
      'ADDRESS_NOT_FOUND',
      '주소를 찾지 못했어요. 도로명 또는 지번 주소로 다시 입력해 주세요.',
    )
  const region = NON_SEOUL.find((r) => q.includes(r))
  if (region)
    return fail(422, 'OUT_OF_SEOUL', '현재는 서울특별시 주소만 진단할 수 있어요.', {
      region_1depth: region,
    })

  const first = base(category)
  const data: GeocodeResult = {
    ...first,
    candidates: q.includes('여러')
      ? [
          first,
          {
            ...first,
            address_road: '서울특별시 마포구 ○○로 12-1',
            address_jibun: '서울특별시 마포구 ○○동 123-5',
            building_key: '마포구-○○동-123-5',
            floor_unit: null,
          },
        ]
      : [],
  }
  return ok(data, {
    source: ['R8'],
    as_of: null,
    space: 'point',
    denominator: null,
    data_updated_at: null,
    is_demo: true,
    data_version: null,
  })
}
