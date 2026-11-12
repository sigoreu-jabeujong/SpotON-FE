/**
 * GET /api/support-links 목업 — BE support-links-v2와 같은 구조 (BE docs/fe-support-links-api-request.md).
 * - 구(sigungu) 생략: 공통 4곳 (원본 D-08 순서)
 * - 구 지정: 관할 지역센터 1곳 + 공통 4곳. 업종(category)은 목록·순서에 영향 없음
 * - 서울 25개 구 이름이 아니거나 빈 값·"null" → 422 (실제 BE와 같음)
 * 문구·확인일은 2026-11-12 로컬 BE 응답을 옮긴 시연용 값이다.
 */
import type { SupportLink, SupportLinks } from '../../types/support'
import { fail, ok } from './common'
import type { MockHandler } from './index'

const CHECKED = '2026-11-12'
const NOTICE_URL =
  'https://www.mss.go.kr/site/smba/ex/bbs/View.do?bcIdx=1071565&cbIdx=310&parentSeq=1071565'

const COMMON: SupportLink[] = [
  {
    id: 'seoulsbdc',
    org_name: '서울시 자영업지원센터',
    title: '창업·경영 상담 안내',
    description: '공식 홈페이지에서 창업·경영 상담과 지원 안내를 확인하세요.',
    url: 'https://www.seoulsbdc.or.kr/main.do',
    type: 'consulting',
    region: '서울',
    last_checked: CHECKED,
  },
  {
    id: 'seoulsbdc-edu',
    org_name: '소상공인아카데미',
    title: '창업·경영 교육 안내',
    description: '예비창업자·소상공인을 위한 교육 과정과 수강 안내를 확인하세요.',
    url: 'https://edu.seoulsbdc.or.kr/main/index.jsp',
    type: 'support_program',
    region: '서울',
    last_checked: CHECKED,
  },
  {
    id: 'seoul-small-business',
    org_name: '서울시 소상공인 지원사업 안내',
    title: '서울시 지원사업 안내',
    description: '서울시 소상공인 종합지원 사업과 기관별 안내를 확인하세요.',
    url: 'https://news.seoul.go.kr/economy/small-business-supports',
    type: 'support_program',
    region: '서울',
    last_checked: CHECKED,
  },
  {
    id: 'sbiz24',
    org_name: '소상공인24',
    title: '소상공인 지원사업 통합 안내',
    description: '전국 소상공인 지원사업 공고와 신청 안내를 확인하세요.',
    url: 'https://www.sbiz24.kr',
    type: 'support_program',
    region: '전국',
    last_checked: CHECKED,
  },
]

/** 관할 지역센터 (2026-10-01 중기부 공고 별표2) — [id 끝, 센터명, 관할 구, 전화] */
/* prettier-ignore */
const CENTERS: [string, string, string[], string][] = [
  ['jungbu', '서울중부센터', ['중구', '종로구', '성북구', '동대문구'], '02-720-4711'],
  ['dongbu', '서울동부센터', ['광진구', '성동구', '강동구', '중랑구'], '02-2215-0981'],
  ['seobu', '서울서부센터', ['강서구', '양천구', '영등포구'], '02-839-8311'],
  ['nambu', '서울남부센터', ['강남구', '서초구', '송파구'], '02-585-8622'],
  ['bukbu', '서울북부센터', ['노원구', '도봉구', '강북구'], '02-990-9101'],
  ['dongjak', '서울동작센터', ['동작구', '용산구'], '02-3482-6686'],
  ['gwanak', '서울관악센터', ['관악구', '구로구', '금천구'], '02-889-9262'],
  ['seodaemun', '서울서대문센터', ['서대문구', '은평구', '마포구'], '02-323-2915'],
]

function districtLink(gu: string): SupportLink | null {
  const c = CENTERS.find(([, , gus]) => gus.includes(gu))
  if (!c) return null
  const [key, name, gus, tel] = c
  return {
    id: `semas-seoul-${key}`,
    org_name: `소상공인시장진흥공단 ${name}`,
    title: `${name} 지역센터 연락처 안내`,
    description: `2026년 공고 별표2 기준 관할: ${gus.join('·')}. 전화: ${tel}. 연결된 공고의 첨부 PDF 25쪽을 확인하세요.`,
    url: NOTICE_URL,
    type: 'consulting',
    region: '서울',
    last_checked: CHECKED,
  }
}

const BASE_META = {
  source: ['R17'],
  as_of: null,
  space: null,
  denominator: null,
  collected_at: null,
  data_version: null,
  data_updated_at: CHECKED,
  is_demo: true,
  link_catalog_version: 'support-links-v2',
}

export const supportLinksMock: MockHandler = (query) => {
  const gu = query.get('sigungu')
  const category = query.get('category')
  if (category !== null && category !== 'cafe' && category !== 'restaurant')
    return fail(422, 'INVALID_PARAM', '요청 값을 확인해 주세요')
  if (gu === null)
    return ok<SupportLinks>(
      { links: COMMON },
      { ...BASE_META, prioritization: { status: 'not_applied', reason: 'general_links_only' } },
    )
  const district = districtLink(gu)
  if (!district) return fail(422, 'INVALID_PARAM', '요청 값을 확인해 주세요')
  return ok<SupportLinks>(
    { links: [district, ...COMMON] },
    {
      ...BASE_META,
      prioritization: {
        status: 'applied',
        reason: 'district_contact_first',
        category_applied: false,
      },
      district_contact_source: {
        url: NOTICE_URL,
        published_on: '2026-10-01',
        checked_on: CHECKED,
        page: 25,
        table: 'annex_2',
      },
    },
  )
}
