/** GET /api/support-links 목업 — 07 데이터 활용 명세서 2.3의 4곳 (설명 문구는 시연용) */
import type { SupportLinks } from '../../types/support'
import { ok } from './common'
import type { MockHandler } from './index'

const LINKS: SupportLinks = {
  links: [
    {
      id: 'seoulsbdc',
      org_name: '서울시 자영업지원센터',
      title: '창업 상담',
      description: '서울 예비창업자·소상공인 대상 상담 안내',
      url: 'https://www.seoulsbdc.or.kr/main.do',
      type: 'consulting',
      region: '서울',
      last_checked: '2026-11-01',
    },
    {
      id: 'seoulsbdc-edu',
      org_name: '소상공인아카데미',
      title: '창업 교육',
      description: '예비창업자·소상공인 대상 교육 과정 안내',
      url: 'https://edu.seoulsbdc.or.kr/main/index.jsp',
      type: 'support_program',
      region: '서울',
      last_checked: '2026-11-01',
    },
    {
      id: 'seoul-small-business',
      org_name: '서울시 소상공인 지원사업 안내',
      title: '지원사업 안내',
      description: '서울시 소상공인 지원사업 모음',
      url: 'https://news.seoul.go.kr/economy/small-business-supports',
      type: 'support_program',
      region: '서울',
      last_checked: '2026-11-01',
    },
    {
      id: 'sbiz24',
      org_name: '소상공인24',
      title: '소상공인 지원 통합 안내',
      description: '전국 소상공인 지원사업 신청·조회',
      url: 'https://www.sbiz24.kr',
      type: 'support_program',
      region: '전국',
      last_checked: '2026-11-01',
    },
  ],
}

export const supportLinksMock: MockHandler = () =>
  ok(LINKS, {
    source: ['R17'],
    as_of: null,
    space: null,
    denominator: null,
    data_updated_at: '2026-11-01',
    is_demo: true,
    data_version: null,
  })
