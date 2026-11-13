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
import { DEMO_META, fail, isMockResult, ok, radiusSpace, unknownFlags } from './common'
import type { MockHandler } from './index'
import { formatOperatingMonths } from '../../utils/format'
import { SUB_CATEGORY_LABEL } from '../../constants/labels'
import type { MarketActivity } from '../../types/market'
import { marketActivityMock } from './market'
import { storeStats } from './nearby'

/** 표본 부족 기준: 반경 안 동일 업종 10건 미만 (분석 로직 정의서) */
const MIN_STORES = 10
/** 생존율 계산 기준: 대상 신규 점포 5건 이상 */
const MIN_COHORT = 5

/** 목업 전용: 소수 첫째 자리 % */
const percent = (num: number, den: number) => Math.round((num / den) * 1000) / 10

/** 공식 창업위험도 안내 링크 (서울시 상권분석서비스) */
const OFFICIAL_RISK_LINK = 'https://golmok.seoul.go.kr/stateDistrict.do'

/** 상권 판정 목업 규칙: lat 값으로 세 경우를 모두 볼 수 있게 (기본은 실제 BE와 같은 unverified) */
function mockMarketStatus(lat: string | null): MarketJudgement['status'] {
  if (lat === '37.5') return 'outside'
  if (lat === '37.51') return 'in_market'
  return 'unverified'
}

/**
 * 위험도 목업 — 시연용 가상 값. LQ는 범위 밖이라 넣지 않음. 사유는 실제 BE처럼 코드로, 출처는 배열로.
 * 동종업체 수·참고 폐업률·생존율은 nearby.ts 점포 목록에서 센다 (지도·표·상권 활동과 같은 집합).
 * 화면 확인용 규칙 (/risk는 bk를 받지 않으므로 공통 조회 파라미터로 전환):
 * - 상권 판정 (mockMarketStatus): 기본 → 확인 중(unverified, 실제 BE와 같음): 공식 폐업률·상권변화 판단 보류,
 *   공식 창업위험도 링크만(copy_text null) / lat=37.51 → 상권 안(in_market, 공식 수치 예시) /
 *   lat=37.5 → 상권 밖(outside, 공식 폐업률 no_data + nearby_markets)
 * - 상권 안일 때: restaurant → official_risk BE 형식(link_only + copy_text), cafe → PDF 형식(no_data + source_url)
 * - category=restaurant → 서울 평균 있음 / cafe → 서울 평균 산정 전(null + 사유)
 * - 동종업체 수는 서울 비교 대상 아님 (seoul_avg_reason = not_applicable)
 * - 반경 안 동일 업종 10건 미만(필터 없으면 반경 300m) → 표본 부족(insufficient_sample), 참고 폐업률 판단 보류
 */
export const riskMock: MockHandler = (query) => {
  const flags = unknownFlags(query)
  if (isMockResult(flags)) return flags
  const category = (query.get('category') ?? 'cafe') as Category
  const { radius, space } = radiusSpace(query)
  const stats = storeStats(query)
  const asOf = stats.t
  const marketStatus = mockMarketStatus(query.get('lat'))
  const outside = marketStatus === 'outside'
  const unverified = marketStatus === 'unverified'
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
          source: ['R5', 'R6'],
          status: 'pending',
          reason: c.denominator === 0 ? 'zero_denominator' : 'insufficient_sample',
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
          source: ['R5', 'R6'],
          status: 'fact',
        }

  const market: MarketJudgement = unverified
    ? {
        // 공식 상권 적용 기준 확인 중 — 상권 안·밖으로 확정하지 않는다 (실제 BE 응답과 같은 모양)
        status: 'unverified',
        market_code: null,
        market_name: null,
        market_type: null,
        also_in: [],
        nearby_markets: [],
        reason: 'boundary_period_not_verified',
        spatial_candidate: null,
      }
    : outside
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

  const officialClosure: MetricIndicator = unverified
    ? {
        id: 'official_closure_rate',
        type: 'official',
        value: null,
        unit: '%',
        space: 'market',
        source: ['R2'],
        status: 'pending',
        reason: 'boundary_period_not_verified',
      }
    : outside
      ? {
          id: 'official_closure_rate',
          type: 'official',
          value: null,
          unit: '%',
          space: 'market',
          source: ['R2'],
          status: 'no_data',
          reason: 'outside_market',
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
          source: ['R2'],
          status: 'fact',
        }

  const officialRisk: OfficialRiskIndicator = unverified
    ? {
        // 실제 BE: 링크 안내만, 상권을 모르니 복사 문구 없음
        id: 'official_risk',
        type: 'official',
        value: null,
        status: 'link_only',
        link: OFFICIAL_RISK_LINK,
        copy_text: null,
        source: ['R1'],
      }
    : restaurant
      ? {
          id: 'official_risk',
          type: 'official',
          value: null,
          status: 'link_only',
          link: OFFICIAL_RISK_LINK,
          copy_text: outside ? null : `○○역 · ${categoryName}`,
          source: ['R1'],
        }
      : {
          id: 'official_risk',
          type: 'official',
          value: null,
          unit: 'grade',
          status: 'no_data',
          reason: '공식 창업위험도는 서울시 상권분석서비스에서 확인',
          source: ['R1'],
          source_url: OFFICIAL_RISK_LINK,
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
        value: unverified || outside ? null : restaurant ? 'LH' : null,
        unit: 'type',
        space: 'market',
        period: unverified || outside ? null : '2026-Q2',
        source: ['R16'],
        status: unverified ? 'pending' : outside ? 'no_data' : restaurant ? 'fact' : 'pending',
        reason: unverified
          ? 'boundary_period_not_verified'
          : outside
            ? 'outside_market'
            : restaurant
              ? null
              : '상권변화지표 자료 확보 전',
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
            source: ['R5', 'R6'],
            status: 'pending',
            reason: stats.closureDenominator === 0 ? 'zero_denominator' : 'insufficient_sample',
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
            source: ['R5', 'R6'],
            status: 'fact',
          },
      survival('survival_rate_1y', stats.survival1y, 78.4),
      survival('survival_rate_3y', stats.survival3y, 55.1),
      {
        id: 'competitor_count',
        type: 'reference',
        value: competitors,
        unit: '개',
        // 동종업체 수는 서울 평균 비교 대상이 아니다 (0곳도 fact)
        seoul_avg: null,
        seoul_avg_reason: 'not_applicable',
        space,
        period: asOf,
        source: ['R5', 'R6'],
        status: 'fact',
      },
      {
        id: 'day_night_ratio',
        type: 'reference',
        value: null,
        unit: '배',
        space: 'grid',
        source: ['R4'],
        status: 'pending',
        reason: 'population_aggregation_and_grid_time_unverified',
      },
    ],
    // missing: 공식 폐업률에 필요한 검증 경계(확인 중일 때)와 선택 항목만
    flags: {
      insufficient_sample: small,
      missing: unverified ? ['official_closure_rate', 'living_pop'] : ['living_pop'],
    },
  }
  return ok(data, {
    ...DEMO_META,
    source: ['R1', 'R2', 'R5', 'R6'],
    as_of: asOf,
    space,
    denominator: competitors,
    data_version: { ...DEMO_META.data_version, trdar_quarter: unverified ? null : '20262' },
    // 가맹 필터를 고르면 이름 일치 추정의 한계 코드 (BE 가맹 추정 요청서 5장)
    ...((query.get('franchise') ?? 'all') !== 'all'
      ? { limitations: ['franchise_name_match_not_contract_or_history'] }
      : {}),
  })
}

/** 부족한 자료 안내에 쓸 지표 이름 */
const INDICATOR_NAME: Partial<Record<IndicatorId, string>> = {
  official_closure_rate: '서울시 공식 폐업률',
  market_change: '상권변화지표',
  closure_rate_12m: '참고 폐업률(최근 12개월)',
  survival_rate_1y: '개업 1주년 생존율',
  survival_rate_3y: '개업 3주년 생존율',
  day_night_ratio: '주야간 인구 비',
}

/** 목업 전용: "2026-Q2" → "2026년 2분기" */
const quarterKo = (p: string | null | undefined) =>
  (p ?? '').replace(/^(\d{4})-Q([1-4])$/, '$1년 $2분기')

/**
 * AI 해석 목업 — 서버가 다시 계산한 Risk 값으로만 문장을 만든다 (실제 BE도 FE가 보낸 수치를 쓰지 않는다).
 * 그래서 반경·업종·시점이 바뀌어도 AI 문장 숫자가 지표 카드·지도와 같다.
 */
function buildInterpretation(risk: Risk): RiskInterpretation {
  const r = risk.query.radius_m.toLocaleString('ko-KR')
  const metric = (id: MetricIndicator['id']) =>
    risk.indicators.find((i): i is MetricIndicator => i.id === id)
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
          text: `이 주소가 속한 ${risk.market.market_name ?? ''} 상권의 ${quarterKo(official.period)} 공식 폐업률은 ${official.value}%(${official.denominator}곳 중 ${official.numerator}곳)입니다.`,
          indicator_ids: ['official_closure_rate'],
        },
      ]
    : [
        {
          text:
            risk.market.status === 'unverified'
              ? '공식 상권 적용 기준을 확인 중이라 서울시 공식 폐업률은 아직 보여드리지 않습니다. 가까운 상권 수치로 대신하지 않았습니다.'
              : '상권 밖 주소라 서울시 공식 폐업률은 자료가 없습니다. 가까운 상권 수치로 대신하지 않았습니다.',
          indicator_ids: ['official_closure_rate'],
        },
      ]
  if (n !== null)
    official_values.push({
      text: `반경 ${r}m 안에 같은 업종 ${n}곳이 영업 중입니다.`,
      indicator_ids: ['competitor_count'],
    })

  const favorable: RiskInterpretation['favorable'] = []
  if (isFact(survival1y))
    favorable.push({
      text: `반경 ${r}m 개업 1주년 생존율은 ${pct(survival1y.value)}%(${survival1y.denominator}곳 중 ${survival1y.numerator}곳)로, 최근 문을 연 점포 상당수가 1년 넘게 영업을 이어 갔습니다.`,
      indicator_ids: ['survival_rate_1y'],
      sources: ['R5', 'R6'],
    })

  const unfavorable: RiskInterpretation['unfavorable'] = isFact(closure)
    ? [
        {
          text: `반경 ${r}m 최근 12개월 참고 폐업률은 ${pct(closure.value)}%(${closure.denominator}곳 중 ${closure.numerator}곳)입니다. 공식 폐업률과는 기간(12개월과 분기)과 공간(반경과 상권)이 달라 직접 비교할 수 없습니다.`,
          indicator_ids: ['closure_rate_12m'],
          sources: ['R5', 'R6'],
        },
      ]
    : []

  const metrics = risk.indicators.filter((i): i is MetricIndicator => i.id !== 'official_risk')
  // 사유는 서버 코드 그대로 (화면이 indicatorReasonText로 문구로 바꾼다)
  const missing_data: RiskInterpretation['missing_data'] = metrics
    .filter((i) => (i.status === 'pending' || i.status === 'no_data') && INDICATOR_NAME[i.id])
    .map((i) => ({ text: INDICATOR_NAME[i.id] ?? i.id, reason: i.reason ?? 'no_data' }))
  const seoulMissing = metrics.find(
    (i) => i.type === 'reference' && i.unit === '%' && i.seoul_avg_reason,
  )
  if (seoulMissing?.seoul_avg_reason)
    missing_data.push({ text: '서울 평균 비교', reason: seoulMissing.seoul_avg_reason })
  // 목록 적용 DB는 가맹 추정 한계를 함께 안내한다 (BE 가맹 추정 요청서 5장)
  missing_data.push({
    text: '프랜차이즈 여부는 2025년 브랜드 목록과 상호가 같은지로 추정한 값이에요',
    reason: 'franchise_name_match_estimate',
  })

  return {
    label: 'AI 해석',
    method: 'server_sentences_model_ordering',
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
    ],
    verification: { passed: true, checked_numbers: 6, mismatches: [], regenerated: false },
    model: '(AI 설계서에서 확정)',
    // 이번 응답의 서버 문장 조립 시각 (UTC)
    generated_at: '2026-11-09T05:02:11Z',
  }
}

/** AI가 해석을 만드는 시간 흉내 (1~2초) */
const AI_DELAY_MS = 1500

/** query에 허용하는 키 (BE RiskQuery와 같은 이름). 그 밖의 키는 422 */
const QUERY_KEYS = new Set([
  'lat',
  'lng',
  'category',
  'radius',
  'sub_category',
  'as_of',
  'area',
  'franchise',
  'include',
  'include_unknown',
  'include_unknown_area',
  'include_unknown_franchise',
])

const invalid = () => ({
  ...fail(422, 'INVALID_PARAM', '요청 값을 확인해 주세요'),
  delayMs: AI_DELAY_MS,
})

/**
 * POST /api/risk/interpret 목업 — 본문은 { query: 원래 조회 조건 }만 (query-only).
 * - market·indicators·flags·context 등 다른 키, Risk 응답 query(radius_m·filters), building_key·floor_unit,
 *   lat·lng 숫자 아님, as_of가 YYYY-MM 아님, include_unknown과 개별 unknown 플래그 혼용 → 422 INVALID_PARAM
 * - radius = 1000 → 503 AI_UNAVAILABLE (AI 실패 안내·다시 시도 확인)
 * - radius = 300 → 503 AI_VERIFY_FAILED (서버가 1회 재생성 후에도 검증 실패)
 * - 정상이면 같은 조건으로 Risk를 다시 계산해 문장을 조립한다
 */
export const riskInterpretMock: MockHandler = (_query, body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return invalid()
  const keys = Object.keys(body)
  if (keys.length !== 1 || keys[0] !== 'query') return invalid()
  const q = (body as RiskInterpretRequest).query as Record<string, unknown>
  if (!q || typeof q !== 'object') return invalid()
  if (Object.keys(q).some((k) => !QUERY_KEYS.has(k))) return invalid()
  if (typeof q.lat !== 'number' || typeof q.lng !== 'number' || typeof q.category !== 'string')
    return invalid()
  if (q.as_of !== undefined && !(typeof q.as_of === 'string' && /^\d{4}-\d{2}$/.test(q.as_of)))
    return invalid()
  if (
    q.include_unknown !== undefined &&
    (q.include_unknown_area !== undefined || q.include_unknown_franchise !== undefined)
  )
    return invalid()

  const radius = Number(q.radius ?? 500)
  if (radius === 1000)
    return { ...fail(503, 'AI_UNAVAILABLE', 'AI 해석을 불러오지 못했어요.'), delayMs: AI_DELAY_MS }
  if (radius === 300)
    return {
      ...fail(503, 'AI_VERIFY_FAILED', 'AI 해석을 검증하지 못했어요.'),
      delayMs: AI_DELAY_MS,
    }

  // 같은 조건으로 Risk를 다시 계산 (FE가 보낸 수치는 받지 않는다)
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null) continue
    params.set(k, Array.isArray(v) ? v.join(',') : String(v))
  }
  const recomputed = riskMock(params, null)
  if (recomputed.status !== 200 || !recomputed.body.data) return invalid()
  const risk = recomputed.body.data as Risk
  const interpretation = buildInterpretation(risk)
  // BE #96: 같은 조건의 상권 활동 집계로 참고 계산 문장을 official_values 끝에 덧붙인다
  // (최근 개폐업 1개 + 세부 업종마다 평균 경과 기간 1개 — 카페 1개, 음식점 전체 4개)
  const activity = marketActivityMock(params, null)
  if (activity.status === 200 && activity.body.data)
    interpretation.official_values.push(...activitySentences(activity.body.data as MarketActivity))
  return {
    ...ok(interpretation, {
      ...DEMO_META,
      source: ['R2', 'R5', 'R6'],
      as_of: risk.query.as_of,
      denominator: null,
    }),
    delayMs: AI_DELAY_MS,
  }
}

/**
 * 목업 전용: 상권 활동 참고 계산 문장 (BE #96 모양). 평균 경과 기간은 기준일에 영업 중인 기록의
 * 개업 후 경과 개월 평균 — 점포 수명·생존 기간으로 쓰지 않는다
 */
function activitySentences(a: MarketActivity): RiskInterpretation['official_values'] {
  const recent = {
    text: `참고 계산: 최근 12개월(${a.recent_12m.period.replace('~', ' ~ ')}) 반경 안 같은 업종 개업 ${a.recent_12m.opened}건, 폐업 ${a.recent_12m.closed}건이 기록됐습니다.`,
    indicator_ids: ['recent_open_close' as const],
  }
  const avg = a.by_sub_category.map((s) => ({
    text:
      s.avg_operating_months === null
        ? `참고 계산: ${SUB_CATEGORY_LABEL[s.sub_category]} 업종은 기준일에 영업 중인 기록의 평균 경과 기간을 계산하지 않았습니다.`
        : `참고 계산: ${SUB_CATEGORY_LABEL[s.sub_category]} 업종에서 기준일에 영업 중인 기록 ${s.open_count}건의 개업 후 평균 경과 기간은 ${formatOperatingMonths(s.avg_operating_months)}입니다.`,
    indicator_ids: ['avg_operating_months' as const],
  }))
  return [recent, ...avg]
}
