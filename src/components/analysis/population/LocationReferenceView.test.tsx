import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { LocationReference, ReferenceNumber } from '../../../types/locationReference'
import LocationReferenceView from './LocationReferenceView'

/** 결과 화면용 참고자료 (진단서용 LocationReferencePrint는 LocationReferencePrint.test.tsx) */
function number(
  display: string,
  value = '12.34',
  unit = 'estimated_people_hourly_mean',
): ReferenceNumber {
  return { value, display, unit, rounded: false, exact_zero: false }
}
// 서버 display처럼 천 단위 쉼표 (큰 정수도 자릿수 그대로 — BigInt)
const perStore = (value: string) =>
  number(`${BigInt(value).toLocaleString('ko-KR')}원/점포`, value, 'KRW_source_reported_per_store')

function fixture(): LocationReference {
  return {
    requested_as_of: '2023-11',
    analysis_as_of: '2023-11-30',
    time_mode: 'latest_reference',
    sales: {
      status: 'ready',
      reason: null,
      items: [
        {
          market_code: '3110000',
          market_name: '합성상권',
          industry_code: 'CS100010',
          industry_name: '커피',
          spatial_relation: 'intersects_radius',
          source_quarter: '20254',
          temporal_relation: 'later_reference',
          metric: number('9,007,199,254,740,993원', '9007199254740993', 'KRW_source_reported'),
          per_store_metric: perStore('9007199254740993'),
          store_reference: { total_stores: '82', reason: null },
          average_contribution: { status: 'included', reason: null },
          status: 'ready',
          reason: null,
        },
        {
          market_code: '3110001',
          market_name: '다른분기상권',
          industry_code: 'CS100010',
          industry_name: '커피',
          spatial_relation: 'intersects_radius',
          source_quarter: '20251',
          temporal_relation: 'earlier_reference',
          metric: number('38,420,158원', '38420158', 'KRW_source_reported'),
          per_store_metric: perStore('12806719'),
          store_reference: { total_stores: '3', reason: null },
          average_contribution: { status: 'different_quarter', reason: 'different_quarter' },
          status: 'ready',
          reason: null,
        },
        {
          market_code: '3110002',
          market_name: '자료없는상권',
          industry_code: 'CS100010',
          industry_name: '커피',
          spatial_relation: 'intersects_radius',
          source_quarter: null,
          temporal_relation: null,
          metric: null,
          average_contribution: { status: 'excluded', reason: 'sales_unavailable' },
          status: 'no_data',
          reason: 'no_source_rows',
        },
      ],
    },
    living_population: {
      status: 'ready',
      reason: null,
      items: [
        {
          area_ref: 'synthetic',
          area_name: '합성동',
          spatial_relation: 'contains_point',
          observation_date: '2026-10-31',
          source_month: '202610',
          temporal_relation: 'later_reference',
          population_scope: 'local',
          mean_24h: number('21,539.5명'),
          status: 'ready',
          reason: null,
          observed_hours: 24,
          source_hours: 24,
          provenance_ref: 'local-day',
        },
      ],
    },
    day_night: {
      status: 'ready',
      reason: null,
      items: [
        {
          area_ref: 'synthetic',
          observation_date: '2026-10-31',
          population_scope: 'local',
          mean_day: number('21,879.6명'),
          mean_night: number('21,199.3명'),
          day_night_ratio: number('1.03209'),
          day_share_pct: number('50.8%', '50.8'),
          night_share_pct: number('49.2%', '49.2'),
          status: 'ready',
          reason: null,
          provenance_ref: 'local-day',
        },
      ],
    },
  }
}

function withAverage(data: LocationReference) {
  data.sales.per_store_average = {
    status: 'ready',
    primary_quarter: '20254',
    temporal_relation: 'earlier_reference',
    representative_method: 'pooled_sales_over_total_stores_v1',
    metric: perStore('250000'),
    total_sales: '10000000',
    total_store_count: '40',
    listed_item_count: 3,
    included_item_count: 1,
    excluded_counts: { different_quarter: 1, sales_unavailable: 1 },
    groups: [
      { source_quarter: '20254', metric: perStore('250000') },
      { source_quarter: '20251', metric: perStore('12806719') },
    ],
  }
  return data
}

describe('결과 화면 위치 참고자료 — 핵심 숫자 + 한 줄', () => {
  it('추정매출: 큰 숫자, 상권 수·분기·추정치 한 줄, 서버 금액 글자 그대로', () => {
    const html = renderToStaticMarkup(<LocationReferenceView data={withAverage(fixture())} />)
    expect(html).toContain('점포당 추정 매출')
    expect(html).toContain('250,000원')
    expect(html).toContain('인근 상권 1곳 · 2025년 4분기 · 추정치(실제 매출 아님)')
    // 큰 정수 금액도 서버 표시 그대로 (자릿수 손실 없음)
    expect(html).toContain('9,007,199,254,740,993원')
    expect(html).toContain('출처: 서울시 상권분석서비스 추정매출 · 상권 단위')
  })

  it('상권별은 접힌 표 — 자료 없음·다른 분기는 짧게, 반복 문구 없음', () => {
    const html = renderToStaticMarkup(<LocationReferenceView data={withAverage(fixture())} />)
    expect(html).toContain('상권별 자세히 보기 (3곳)')
    const table = html.slice(html.indexOf('<details'), html.indexOf('</details>'))
    expect(table).toContain('다른분기상권')
    expect(table).toContain('다른 분기')
    expect(table).toContain('자료없는상권')
    expect(table).toContain('자료 없음')
    expect(table).toContain('82개')
    expect(table).toContain('2025년 1분기 평균 12,806,719원')
    for (const removed of [
      '대체값 아님',
      '추정 분포 반영 대상',
      '분석 기준 이전 참고자료',
      '평균 산정 대상',
    ])
      expect(html).not.toContain(removed)
  })

  it('긴 안내 문단은 화면 본문에서 빠지고 (ⓘ 팝오버로), 같은 문장이 두 번 나오지 않는다', () => {
    const html = renderToStaticMarkup(<LocationReferenceView data={withAverage(fixture())} />)
    for (const moved of [
      '반경 비율로 나누지 않아요',
      '기존 AI 해석에 반영되는 값은 아니에요',
      '점포 수 가중평균(비교)',
      '통계적 추정치이며 실제 방문객',
      '주간 06~17시',
    ])
      expect(html).not.toContain(moved)
    expect(html.match(/추정치\(실제 매출 아님\)/g)).toHaveLength(1)
    expect(html).toContain('aria-haspopup="dialog"')
  })

  it('생활인구 카드: 행정동·관측일(새 날짜 표기), 큰 숫자, 주간·야간 막대와 비중 한 줄, 소수 배수 없음', () => {
    const html = renderToStaticMarkup(<LocationReferenceView data={fixture()} />)
    expect(html).toContain('생활인구 (주간·야간)')
    expect(html).toContain('합성동')
    expect(html).toContain('관측일 2026. 10. 31.')
    expect(html).not.toContain('2026-10-31')
    expect(html).toContain('21,539.5명')
    expect(html).toContain('21,879.6명')
    expect(html).toContain('21,199.3명')
    expect(html).toContain('주간 50.8% · 야간 49.2%')
    expect(html).toContain('width:50.8%')
    expect(html).not.toContain('1.03209')
    expect(html).toContain('출처: 서울시 행정동 내국인 생활인구 · 행정동 단위 · 통계적 추정치')
  })

  it('다른 날짜·원천의 주야간 비교는 이 행정동에 붙이지 않는다', () => {
    const data = fixture()
    data.day_night.items[0].observation_date = '2026-10-30'
    const html = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(html).toContain('비교 자료의 구역·관측일을 확인할 수 없어요')
    expect(html).not.toContain('21,879.6명')
    expect(html).not.toContain('주간 50.8%')
  })

  it('비공개·누락으로 평균이 없으면 숫자 대신 사유', () => {
    const data = fixture()
    data.living_population.items[0].mean_24h = null
    data.living_population.items[0].reason = 'no_complete_day'
    data.living_population.items[0].observed_hours = 20
    const html = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(html).toContain('비공개 값 또는 누락 시간')
    expect(html).toContain('공개된 관측 시간 20/24시간')
  })

  it('격자 부분자료는 같은 카드 맨 아래 접힌 영역 안에', () => {
    const html = renderToStaticMarkup(
      <LocationReferenceView data={fixture()} grid={<p>격자표</p>} />,
    )
    const card = html.slice(html.indexOf('data-card="population"'))
    expect(card).toContain('격자 단위 부분자료 보기')
    expect(card.indexOf('<details')).toBeLessThan(card.indexOf('격자표'))
  })

  it('가중 중앙값 방식이면 중간값을 큰 숫자로, 그래프는 쉬운 말·가중 분산 없음', () => {
    const data = fixture()
    const metric = (value: string) => perStore(value)
    data.sales.items = ['500', '173'].map((count, index) => ({
      ...data.sales.items[0],
      market_code: `311000${index}`,
      metric: number(
        index === 0 ? '50,000원' : '155,700원',
        index === 0 ? '50000' : '155700',
        'KRW_source_reported',
      ),
      store_reference: { total_stores: count, reason: null },
      per_store_metric: metric(index === 0 ? '100' : '900'),
      average_contribution: { status: 'included', reason: null },
    }))
    data.sales.per_store_average = {
      status: 'ready',
      primary_quarter: '20254',
      representative_method: 'store_weighted_median_v1',
      graph_basis: 'store_weighted_histogram_v1',
      metric: metric('306'),
      total_sales: '205700',
      total_store_count: '673',
      listed_item_count: 2,
      included_item_count: 2,
      excluded_counts: {},
      groups: [],
      store_weighted_distribution: {
        method: 'store_weighted_median_v1',
        model: 'repeat_market_mean_for_each_reference_store',
        individual_store_sales_observed: false,
        total_store_count: '673',
        reference_count: 2,
        median: metric('100'),
        mean: metric('306'),
        minimum: metric('100'),
        maximum: metric('900'),
        variance: {
          value: '10000',
          unit: 'KRW_source_reported_per_store_squared',
          scope: 'between_market_per_store_means',
        },
        bin_method: 'equal_width_exact_fraction_v1',
        bins: [
          {
            lower: metric('100'),
            upper: metric('500'),
            store_count: '500',
            upper_inclusive: false,
          },
          { lower: metric('500'), upper: metric('900'), store_count: '173', upper_inclusive: true },
        ],
      },
    }
    const html = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(html).toContain('점포당 추정 매출 분포')
    expect(html).toContain('중간값 100원')
    expect(html).toContain('점포 수 (개)')
    expect(html).not.toContain('가중치')
    expect(html).not.toContain('가중 분산')
    expect(html).not.toContain('가중 중앙값')
  })
})
