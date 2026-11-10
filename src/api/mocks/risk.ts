/** GET /api/risk · POST /api/risk/interpret 목업 — 시연용 가상 값 */
import type { Category } from '../../constants/diagnosis'
import type { Risk, RiskInterpretation, RiskInterpretRequest } from '../../types/risk'
import { DEMO_META, fail, monthEnd, ok, radiusSpace } from './common'
import type { MockHandler } from './index'

/** 위험도: fact / pending / no_data 상태가 모두 나오게 구성. LQ는 범위 밖이라 뺌 */
export const riskMock: MockHandler = (query) => {
  const category = (query.get('category') ?? 'cafe') as Category
  const { radius, space } = radiusSpace(query)
  const asOf = monthEnd(query.get('as_of'))
  const data: Risk = {
    query: {
      address: '서울특별시 ○○구 ○○로 00',
      category,
      radius_m: radius,
      as_of: asOf,
      filters: { franchise: query.get('franchise') ?? 'all' },
    },
    market: {
      status: 'in_market',
      market_code: '3110xxx',
      market_name: '○○역',
      market_type: '발달상권',
      also_in: [],
      nearby_markets: [],
    },
    indicators: [
      {
        id: 'official_closure_rate',
        type: 'official',
        value: 4,
        unit: '%',
        numerator: 3,
        denominator: 71,
        space: 'market',
        period: '2026-Q2',
        source: 'R2',
        status: 'fact',
      },
      {
        // PDF v1.1 형식 (BE 보완안 link_only 형식도 타입상 받을 수 있음)
        id: 'official_risk',
        type: 'official',
        value: null,
        unit: 'grade',
        status: 'no_data',
        reason: '공식 창업위험도는 서울시 상권분석서비스에서 확인',
        source: 'R1',
        source_url: 'https://golmok.seoul.go.kr/stateDistrict.do',
        market_name: '○○역',
      },
      {
        id: 'market_change',
        type: 'official',
        value: null,
        unit: 'type',
        space: 'market',
        source: 'R16',
        status: 'pending',
        reason: '상권변화지표 자료 확보 전',
      },
      {
        id: 'closure_rate_12m',
        type: 'reference',
        value: 17.4,
        unit: '%',
        seoul_avg: null,
        seoul_avg_reason: '서울 평균 산정 전',
        numerator: 8,
        denominator: 46,
        space,
        period: '2025-11~2026-10',
        source: 'R5,R6',
        status: 'fact',
      },
      {
        id: 'survival_rate_1y',
        type: 'reference',
        value: 81.8,
        unit: '%',
        seoul_avg: null,
        seoul_avg_reason: '서울 평균 산정 전',
        numerator: 9,
        denominator: 11,
        space,
        period: '2025~2026',
        source: 'R5,R6',
        status: 'fact',
      },
      {
        id: 'survival_rate_3y',
        type: 'reference',
        value: null,
        unit: '%',
        numerator: null,
        denominator: 4,
        space,
        period: '2023~2026',
        source: 'R5,R6',
        status: 'pending',
        reason: '생존율 계산 대상 신규 점포 5건 미만',
      },
      {
        id: 'competitor_count',
        type: 'reference',
        value: 38,
        unit: '개',
        space,
        period: asOf,
        source: 'R5,R6',
        status: 'fact',
      },
      {
        id: 'day_night_ratio',
        type: 'reference',
        value: null,
        unit: '배',
        space: 'grid',
        source: 'R4',
        status: 'no_data',
        reason: '생활인구 자료 없음',
      },
    ],
    flags: { insufficient_sample: false, missing: ['living_pop'] },
  }
  return ok(data, {
    ...DEMO_META,
    source: ['R1', 'R2', 'R5', 'R6'],
    as_of: asOf,
    space,
    denominator: 46,
    data_version: { ...DEMO_META.data_version, trdar_quarter: '20262' },
  })
}

const INTERPRETATION: RiskInterpretation = {
  label: 'AI 해석',
  official_values: [
    {
      text: '이 주소가 속한 ○○역 상권의 2026년 2분기 공식 폐업률은 4%(71곳 중 3곳)입니다.',
      indicator_ids: ['official_closure_rate'],
    },
  ],
  favorable: [
    {
      text: '반경 500m 안에 같은 업종 38곳이 영업 중이라 수요가 모이는 지역일 수 있습니다.',
      indicator_ids: ['competitor_count'],
      sources: ['R5', 'R6'],
    },
  ],
  unfavorable: [
    {
      text: '반경 500m 최근 12개월 참고 폐업률은 17.4%(46곳 중 8곳)입니다. 공식 폐업률과는 기간(12개월과 분기)과 공간(반경과 상권)이 달라 직접 비교할 수 없습니다. 같은 38곳은 경쟁이 치열하다는 뜻일 수도 있습니다.',
      indicator_ids: ['closure_rate_12m', 'official_closure_rate', 'competitor_count'],
      sources: ['R5', 'R6', 'R2'],
    },
  ],
  missing_data: [
    { text: '3년 생존율', reason: '신규 점포 4곳으로 표본 부족(판단 보류)' },
    { text: '서울 평균 비교', reason: '서울 평균 산정 전' },
  ],
  checklist: [
    {
      item: '계약 자리의 층·호실에서 이전 점포가 운영된 기간과 폐업 사유를 건물주·중개사에게 확인',
      why: '이력 일부가 상세 위치 미확인',
    },
    {
      item: '평일·주말, 낮·저녁 시간대 유동 인구를 현장에서 직접 관찰',
      why: '생활인구 자료 없음',
    },
  ],
  verification: { passed: true, checked_numbers: 6, mismatches: [], regenerated: false },
  model: '(AI 설계서에서 확정)',
  generated_at: '2026-11-09T14:02:11+09:00',
}

export const riskInterpretMock: MockHandler = (_query, body) => {
  const req = body as Partial<RiskInterpretRequest> | null
  if (!req?.query || !req.indicators)
    return fail(400, 'INVALID_PARAM', '입력값을 다시 확인해 주세요.')
  return ok(INTERPRETATION, {
    ...DEMO_META,
    source: ['R2', 'R5', 'R6'],
    as_of: req.query.as_of,
    denominator: 46,
  })
}
