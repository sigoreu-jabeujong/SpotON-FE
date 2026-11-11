/** GET /api/risk · POST /api/risk/interpret 목업 — 시연용 가상 값 */
import type { Category } from '../../constants/diagnosis'
import type {
  IndicatorId,
  MarketJudgement,
  MetricIndicator,
  OfficialRiskIndicator,
  Risk,
  RiskInterpretation,
  RiskInterpretRequest,
} from '../../types/risk'
import { DEMO_META, fail, ok, radiusSpace } from './common'
import type { MockHandler } from './index'
import { storeStats } from './nearby'

/** 표본 부족 기준: 반경 안 동일 업종 10건 미만 (분석 로직 정의서) */
const MIN_STORES = 10
/** 생존율 계산 기준: 대상 신규 점포 5건 이상 */
const MIN_COHORT = 5

/** 목업 전용: 소수 첫째 자리 % */
const percent = (num: number, den: number) => Math.round((num / den) * 1000) / 10

/**
 * 위험도 목업 — 시연용 가상 값. LQ는 범위 밖이라 넣지 않음.
 * 동종업체 수·참고 폐업률·생존율은 nearby.ts 점포 목록에서 센다 (지도·표·상권 활동과 같은 집합).
 * 화면 확인용 규칙 (/risk는 bk를 받지 않으므로 공통 조회 파라미터로 전환):
 * - lat=37.5 → 상권 밖(outside): 공식 폐업률 no_data, nearby_markets 제공
 * - category=restaurant → official_risk를 BE 보완안(link_only + link + copy_text) 형식으로, 서울 평균(seoul_avg) 있음
 * - category=cafe → official_risk를 PDF 형식(no_data + source_url)으로, 서울 평균 산정 전(null + 사유)
 * - 반경 안 동일 업종 10건 미만(필터 없으면 반경 300m) → 표본 부족(insufficient_sample), 참고 폐업률 판단 보류
 */
export const riskMock: MockHandler = (query) => {
  const category = (query.get('category') ?? 'cafe') as Category
  const { radius, space } = radiusSpace(query)
  const stats = storeStats(query)
  const asOf = stats.t
  const outside = query.get('lat') === '37.5'
  const restaurant = category === 'restaurant'
  const competitors = stats.openNow.length
  const small = competitors < MIN_STORES
  const categoryName = restaurant ? '음식점' : '카페'
  const survival = (
    id: 'survival_rate_1y' | 'survival_rate_3y',
    c: (typeof stats)['survival1y'],
    avg: number,
  ): MetricIndicator =>
    c.denominator < MIN_COHORT
      ? {
          id,
          type: 'reference',
          value: null,
          unit: '%',
          ...seoul(avg),
          numerator: null,
          denominator: c.denominator,
          space,
          period: c.period,
          source: 'R5,R6',
          status: 'pending',
          reason: '생존율 계산 대상 신규 점포 5건 미만',
        }
      : {
          id,
          type: 'reference',
          value: percent(c.numerator, c.denominator),
          unit: '%',
          ...seoul(avg),
          numerator: c.numerator,
          denominator: c.denominator,
          space,
          period: c.period,
          source: 'R5,R6',
          status: 'fact',
        }

  const market: MarketJudgement = outside
    ? {
        status: 'outside',
        market_code: null,
        market_name: null,
        market_type: null,
        also_in: [],
        nearby_markets: [
          { market_code: '3110aaa', market_name: '○○사거리 골목상권' },
          { market_code: '3110bbb', market_name: '○○시장 전통시장' },
        ],
      }
    : {
        status: 'in_market',
        market_code: '3110xxx',
        market_name: '○○역',
        market_type: '발달상권',
        also_in: restaurant ? [] : [{ market_code: '3001xxx', market_name: '○○ 관광특구' }],
        nearby_markets: [],
      }

  const officialClosure: MetricIndicator = outside
    ? {
        id: 'official_closure_rate',
        type: 'official',
        value: null,
        unit: '%',
        space: 'market',
        source: 'R2',
        status: 'no_data',
        reason: '상권 밖 주소',
      }
    : {
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
      }

  const officialRisk: OfficialRiskIndicator = restaurant
    ? {
        id: 'official_risk',
        type: 'official',
        value: null,
        status: 'link_only',
        link: 'https://golmok.seoul.go.kr/stateDistrict.do',
        copy_text: outside ? null : `○○역 · ${categoryName}`,
        source: 'R1',
      }
    : {
        id: 'official_risk',
        type: 'official',
        value: null,
        unit: 'grade',
        status: 'no_data',
        reason: '공식 창업위험도는 서울시 상권분석서비스에서 확인',
        source: 'R1',
        source_url: 'https://golmok.seoul.go.kr/stateDistrict.do',
        market_name: outside ? null : '○○역',
      }

  function seoul(value: number) {
    return restaurant
      ? { seoul_avg: value, seoul_avg_reason: null }
      : { seoul_avg: null, seoul_avg_reason: '서울 평균 산정 전' }
  }

  const data: Risk = {
    query: {
      address: '서울특별시 ○○구 ○○로 00',
      category,
      radius_m: radius,
      as_of: asOf,
      filters: { franchise: query.get('franchise') ?? 'all' },
    },
    market,
    indicators: [
      officialClosure,
      officialRisk,
      {
        id: 'market_change',
        type: 'official',
        value: outside ? null : restaurant ? 'LH' : null,
        unit: 'type',
        space: 'market',
        period: outside ? null : '2026-Q2',
        source: 'R16',
        status: outside ? 'no_data' : restaurant ? 'fact' : 'pending',
        reason: outside ? '상권 밖 주소' : restaurant ? null : '상권변화지표 자료 확보 전',
      },
      small
        ? {
            id: 'closure_rate_12m',
            type: 'reference',
            value: null,
            unit: '%',
            ...seoul(15.2),
            numerator: null,
            denominator: stats.closureDenominator,
            space,
            period: stats.period12m,
            source: 'R5,R6',
            status: 'pending',
            reason: '반경 안 동일 업종 10건 미만',
          }
        : {
            id: 'closure_rate_12m',
            type: 'reference',
            value: percent(stats.closed12m, stats.closureDenominator),
            unit: '%',
            ...seoul(15.2),
            numerator: stats.closed12m,
            denominator: stats.closureDenominator,
            space,
            period: stats.period12m,
            source: 'R5,R6',
            status: 'fact',
          },
      survival('survival_rate_1y', stats.survival1y, 78.4),
      survival('survival_rate_3y', stats.survival3y, 55.1),
      {
        id: 'competitor_count',
        type: 'reference',
        value: competitors,
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
    flags: { insufficient_sample: small, missing: ['living_pop'] },
  }
  return ok(data, {
    ...DEMO_META,
    source: ['R1', 'R2', 'R5', 'R6'],
    as_of: asOf,
    space,
    denominator: competitors,
    data_version: { ...DEMO_META.data_version, trdar_quarter: '20262' },
  })
}

/** 부족한 자료 안내에 쓸 지표 이름 */
const INDICATOR_NAME: Partial<Record<IndicatorId, string>> = {
  official_closure_rate: '서울시 공식 폐업률',
  market_change: '상권변화지표',
  closure_rate_12m: '참고 폐업률(최근 12개월)',
  survival_rate_1y: '1년 생존율',
  survival_rate_3y: '3년 생존율',
  day_night_ratio: '주야간 인구 비',
}

/** 목업 전용: "2026-Q2" → "2026년 2분기" */
const quarterKo = (p: string | null | undefined) =>
  (p ?? '').replace(/^(\d{4})-Q([1-4])$/, '$1년 $2분기')

/**
 * AI 해석 목업 — 요청에 담긴 지표 값으로만 문장을 만든다 (실제 서버도 지표 밖 숫자를 쓰지 않는다).
 * 그래서 반경·업종·시점이 바뀌어도 AI 문장 숫자가 지표 카드·지도와 같다.
 */
function buildInterpretation(req: RiskInterpretRequest): RiskInterpretation {
  const r = req.query.radius_m.toLocaleString('ko-KR')
  const metric = (id: MetricIndicator['id']) =>
    req.indicators.find((i): i is MetricIndicator => i.id === id)
  const isFact = (i: MetricIndicator | undefined): i is MetricIndicator & { value: number } =>
    i?.status === 'fact' && typeof i.value === 'number'
  const official = metric('official_closure_rate')
  const competitor = metric('competitor_count')
  const closure = metric('closure_rate_12m')
  const survival1y = metric('survival_rate_1y')
  const n = isFact(competitor) ? competitor.value : null
  /** 참고지표 비율은 카드와 같게 소수 첫째 자리 (80 → "80.0") */
  const pct = (v: number) => v.toFixed(1)

  const official_values: RiskInterpretation['official_values'] = isFact(official)
    ? [
        {
          text: `이 주소가 속한 ${req.market.market_name ?? ''} 상권의 ${quarterKo(official.period)} 공식 폐업률은 ${official.value}%(${official.denominator}곳 중 ${official.numerator}곳)입니다.`,
          indicator_ids: ['official_closure_rate'],
        },
      ]
    : [
        {
          text: '상권 밖 주소라 서울시 공식 폐업률은 자료가 없습니다. 가까운 상권 수치로 대신하지 않았습니다.',
          indicator_ids: ['official_closure_rate'],
        },
      ]

  const favorable: RiskInterpretation['favorable'] = []
  if (n !== null)
    favorable.push({
      text: `반경 ${r}m 안에 같은 업종 ${n}곳이 영업 중이라 수요가 모이는 지역일 수 있습니다.`,
      indicator_ids: ['competitor_count'],
      sources: ['R5', 'R6'],
    })
  if (isFact(survival1y))
    favorable.push({
      text: `반경 ${r}m 1년 생존율은 ${pct(survival1y.value)}%(${survival1y.denominator}곳 중 ${survival1y.numerator}곳)로, 최근 문을 연 점포 상당수가 1년 넘게 영업을 이어 갔습니다.`,
      indicator_ids: ['survival_rate_1y'],
      sources: ['R5', 'R6'],
    })

  const unfavorable: RiskInterpretation['unfavorable'] = isFact(closure)
    ? [
        {
          text: `반경 ${r}m 최근 12개월 참고 폐업률은 ${pct(closure.value)}%(${closure.denominator}곳 중 ${closure.numerator}곳)입니다. 공식 폐업률과는 기간(12개월과 분기)과 공간(반경과 상권)이 달라 직접 비교할 수 없습니다.${n !== null ? ` 같은 ${n}곳은 경쟁이 치열하다는 뜻일 수도 있습니다.` : ''}`,
          indicator_ids: ['closure_rate_12m', 'official_closure_rate', 'competitor_count'],
          sources: ['R5', 'R6', 'R2'],
        },
      ]
    : [
        {
          text: `반경 ${r}m 안 같은 업종이 ${n ?? 0}곳으로 적어 참고 폐업률은 판단을 보류했습니다. 숫자만으로 상권 흐름을 판단하기 어렵습니다.`,
          indicator_ids: ['closure_rate_12m', 'competitor_count'],
          sources: ['R5', 'R6'],
        },
      ]

  const metrics = req.indicators.filter((i): i is MetricIndicator => i.id !== 'official_risk')
  const missing_data: RiskInterpretation['missing_data'] = metrics
    .filter((i) => (i.status === 'pending' || i.status === 'no_data') && INDICATOR_NAME[i.id])
    .map((i) => ({
      text: INDICATOR_NAME[i.id] ?? i.id,
      reason: `${i.reason ?? '자료 없음'}${i.status === 'pending' ? ' (판단 보류)' : ''}`,
    }))
  const seoulMissing = metrics.find((i) => i.type === 'reference' && i.seoul_avg_reason)
  if (seoulMissing?.seoul_avg_reason)
    missing_data.push({ text: '서울 평균 비교', reason: seoulMissing.seoul_avg_reason })

  return {
    label: 'AI 해석',
    official_values,
    favorable,
    unfavorable,
    missing_data,
    checklist: [
      {
        item: '계약 자리의 층·호실에서 이전 점포가 운영된 기간과 폐업 사유를 건물주·중개사에게 확인',
        why: '이력 일부가 상세 위치 미확인',
      },
      {
        item: '평일·주말, 낮·저녁 시간대 유동 인구를 현장에서 직접 관찰',
        why: '생활인구 자료 없음',
      },
      {
        item: '반경 안 같은 업종 점포의 메뉴·가격대·영업시간을 직접 둘러보기',
        why: `동종업체 ${n ?? 0}곳 — 경쟁 정도는 숫자만으로 알 수 없음`,
      },
      {
        item: '초기 6개월 이상 운영할 수 있는 자금 계획 세우기',
        why: isFact(closure)
          ? `최근 12개월 참고 폐업률 ${pct(closure.value)}%`
          : '참고 폐업률 판단 보류 — 표본 부족',
      },
    ],
    verification: { passed: true, checked_numbers: 6, mismatches: [], regenerated: false },
    model: '(AI 설계서에서 확정)',
    generated_at: '2026-11-09T14:02:11+09:00',
  }
}

/** AI가 해석을 만드는 시간 흉내 (1~2초) */
const AI_DELAY_MS = 1500

/**
 * POST /api/risk/interpret 목업 — 화면 확인용 규칙
 * - query.radius_m = 1000 → 503 AI_UNAVAILABLE (AI 실패 안내·다시 시도 확인)
 * - query.radius_m = 300 → 200이지만 verification.passed = false (화면은 실패로 처리해야 함)
 * - 본문에 query·indicators가 없으면 400 INVALID_PARAM
 */
export const riskInterpretMock: MockHandler = (_query, body) => {
  const req = body as Partial<RiskInterpretRequest> | null
  if (!req?.query || !req.indicators)
    return { ...fail(400, 'INVALID_PARAM', '입력값을 다시 확인해 주세요.'), delayMs: AI_DELAY_MS }
  if (req.query.radius_m === 1000)
    return {
      ...fail(503, 'AI_UNAVAILABLE', 'AI 해석을 불러오지 못했어요.'),
      delayMs: AI_DELAY_MS,
    }
  const interpretation = buildInterpretation(req as RiskInterpretRequest)
  const data: RiskInterpretation =
    req.query.radius_m === 300
      ? {
          ...interpretation,
          verification: {
            passed: false,
            checked_numbers: 6,
            mismatches: ['동종업체 수'],
            regenerated: true,
          },
        }
      : interpretation
  return {
    ...ok(data, {
      ...DEMO_META,
      source: ['R2', 'R5', 'R6'],
      as_of: req.query.as_of,
      denominator: null,
    }),
    delayMs: AI_DELAY_MS,
  }
}
