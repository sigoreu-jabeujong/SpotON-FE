import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { LocationReference, ReferenceNumber } from '../../../types/locationReference'
import LocationReferenceView from './LocationReferenceView'

function number(display: string, value = '12.34'): ReferenceNumber {
  return { value, display, unit: 'estimated_people_hourly_mean', rounded: false, exact_zero: false }
}
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
          metric: number('9,007,199,254,740,993원', '9007199254740993'),
          status: 'ready',
          reason: null,
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
          mean_24h: number('12.3명'),
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
          mean_day: number('10.0명'),
          mean_night: number('15.0명'),
          day_night_ratio: number('0.66667'),
          day_share_pct: number('40.0%'),
          night_share_pct: number('60.0%'),
          status: 'ready',
          reason: null,
          provenance_ref: 'local-day',
        },
      ],
    },
  }
}

describe('actual administrative references', () => {
  it('uses the selected top-three estimate and actual source names instead of a legacy median', () => {
    const data = fixture()
    data.sales.top_markets_estimate = {
      method: 'top3_markets_by_store_count_v1',
      source_quarter: '20254',
      status: 'ready',
      reason: null,
      eligible_market_count: 8,
      selected_market_count: 3,
      excluded_item_count: 0,
      total_sales: '2000',
      total_store_count: '150',
      metric: number('13원/점포', '13.333'),
      markets: ['가상상권A', '가상상권B', '가상상권C'].map((name, index) => ({
        market_code: String(index),
        market_name: name,
        total_sales: '100',
        total_store_count: '10',
        industry_codes: ['CS100010'],
        metric: number('10원/점포'),
      })),
    }
    data.sales.per_store_average = {
      status: 'ready',
      primary_quarter: '20254',
      representative_method: 'store_weighted_median_v1',
      metric: number('999,999원/점포'),
      total_sales: '999999',
      total_store_count: '1',
      listed_item_count: 1,
      included_item_count: 1,
      excluded_counts: {},
      groups: [],
      store_weighted_distribution: {
        method: 'store_weighted_median_v1',
        model: 'repeat_market_mean_for_each_reference_store',
        individual_store_sales_observed: false,
        total_store_count: '1',
        reference_count: 1,
        median: number('999,999원/점포'),
        mean: number('999,999원/점포'),
        minimum: number('999,999원/점포'),
        maximum: number('999,999원/점포'),
        variance: {
          value: '0',
          unit: 'KRW_source_reported_per_store_squared',
          scope: 'between_market_per_store_means',
        },
        bin_method: 'equal_width_exact_fraction_v1',
        bins: [],
      },
    }
    const html = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(html).toContain('13원')
    expect(html).toContain('가상상권A · 가상상권B · 가상상권C')
    expect(html).toContain('상권의 매출액을 토대로 추정했습니다.')
    expect(html).toContain('2000원 ÷ 점포 수 합계 150개')
    expect(html).toContain('점포 수 상위 3개 상권')
    expect(html).not.toContain('점포 수 기준 매출 분포')
    expect(html).not.toContain('/점포')
    data.sales.items[0].average_contribution = { status: 'included', reason: null }
    expect(renderToStaticMarkup(<LocationReferenceView data={data} />)).toContain(
      '점포 수 상위 3개 상권 외 참고자료',
    )
    data.sales.top_markets_estimate.markets[0].market_code = data.sales.items[0].market_code
    data.sales.top_markets_estimate.excluded_item_count = 2
    const selected = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(selected).toContain('추정 매출 산정에 반영한 상권')
    expect(selected).toContain('2개 항목은 제외했어요')
    data.sales.top_markets_estimate.selected_market_count = 1
    data.sales.top_markets_estimate.markets = data.sales.top_markets_estimate.markets.slice(0, 1)
    expect(renderToStaticMarkup(<LocationReferenceView data={data} />)).toContain(
      '1곳의 자료를 사용했어요',
    )
    data.sales.top_markets_estimate.status = 'no_data'
    data.sales.top_markets_estimate.selected_market_count = 0
    data.sales.top_markets_estimate.metric = null
    data.sales.top_markets_estimate.markets = []
    const empty = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(empty).toContain('함께 확인할 수 있는 상권이 없어요')
    expect(empty).not.toContain('13원')
    expect(empty).not.toContain('999,999원')
    expect(empty).not.toContain('가중 중앙값')
    expect(empty).not.toContain('점포 수 기준 매출 분포')
    expect(empty).not.toContain('토대로 추정했습니다')
    data.sales.top_markets_estimate = null
    const nullHtml = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(nullHtml).toContain('자료 없음')
    expect(nullHtml).not.toContain('999,999원')
    expect(nullHtml).not.toContain('가중 중앙값')
  })
  it('selects the reference median and labels the weighted mean as comparison only', () => {
    const data = fixture()
    data.sales.per_store_average = {
      status: 'ready',
      primary_quarter: '20254',
      representative_method: 'median_of_reference_per_store_ratios_v1',
      metric: number('900원/점포', '900'),
      total_sales: '9000',
      total_store_count: '10',
      listed_item_count: 3,
      included_item_count: 3,
      excluded_counts: {},
      groups: [],
      distribution: {
        sample_count: 3,
        limited_reference_count: true,
        median: number('20원/점포', '20'),
        q1: number('10원/점포', '10'),
        q3: number('900원/점포', '900'),
        iqr: number('890원/점포', '890'),
        variance: { value: '174200', unit: 'KRW_source_reported_per_store_squared' },
      },
    }
    const html = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(html).toContain('점포당 추정 매출')
    expect(html).toContain('900원')
    expect(html).not.toContain('20원')
    expect(html).toContain('같은 목록의 점포 수 합계')
    expect(html).not.toContain('중앙값 기준')
    expect(html).not.toContain('사분위 범위')
    expect(html).not.toContain('항목 간 분산:')
    expect(html).toContain('점포 수 가중평균(비교)')
    data.sales.per_store_average.distribution!.sample_count = 4
    data.sales.per_store_average.distribution!.limited_reference_count = false
    const four = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(four).toContain('분포를 표시할 자료가 없어요')
  })
  it('shows the server weighted average, calculation basis and excluded reasons', () => {
    const data = fixture()
    data.sales.per_store_average = {
      status: 'partial',
      primary_quarter: '20254',
      metric: number('250,000원/점포', '250000'),
      total_sales: '10000000',
      total_store_count: '40',
      listed_item_count: 3,
      included_item_count: 2,
      excluded_counts: { different_quarter: 1 },
      groups: [{ source_quarter: '20254', metric: number('250,000원/점포', '250000') }],
    }
    const html = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(html).toContain('점포당 추정 매출')
    expect(html).toContain('250,000원')
    expect(html).toContain('10000000')
    expect(html).not.toContain('상권별 점포 수를 가중한 참고평균이에요')
    expect(html).not.toContain('겹치는 상권의 점포는 중복 포함될 수 있어요')
    expect(html).not.toContain('월매출로 환산하지 않아요')
    expect(html).toContain('다른 자료 분기 1항목')
  })
  it('preserves exact source KRW and dates, scopes, intersect labels and independent AI notice', () => {
    const html = renderToStaticMarkup(<LocationReferenceView data={fixture()} />)
    for (const text of [
      '9,007,199,254,740,993원',
      '2026-10-31',
      '2025년 4분기',
      '분석 기준일 2023-11-30',
      '내국인',
      '대체값 아님',
      '기존 AI 해석에 반영되는 값은 아니에요',
      '시간당 평균',
      '0.66667',
    ])
      expect(html).toContain(text)
    expect(html).not.toContain('자료 확인 중')
  })

  it('does not bind day/night of a different date or provenance to the selected area', () => {
    const data = fixture()
    data.day_night.items[0].observation_date = '2026-10-30'
    const html = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(html).toContain('비교 자료의 구역·관측일을 확인할 수 없어요')
    expect(html).not.toContain('0.66667')
  })

  it('keeps masked data absent and zero-night ratio unavailable while means are visible', () => {
    const data = fixture()
    data.living_population.items[0].mean_24h = null
    data.living_population.items[0].reason = 'no_complete_day'
    data.day_night.items[0].reason = 'zero_night_population'
    data.day_night.items[0].day_night_ratio = null
    const html = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(html).toContain('비공개 값 또는 누락 시간')
    expect(html).toContain('야간 값이 0')
    expect(html).not.toContain('0.66667')
    expect(html).toContain('15.0명')
  })

  it('keeps population description and source inside its card and removes requested annotations', () => {
    const data = fixture()
    data.living_population.items[0].mean_24h!.rounded = true
    data.day_night.items[0].mean_day!.rounded = true
    const html = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(html).not.toContain('(표시 반올림)')
    expect(html).not.toContain('(행정동·내국인)')
    expect(html).not.toContain(' · 검색 위치 포함')
    expect(html).not.toContain('외국인을 포함한 전체 생활인구')
    const card = html.slice(
      html.indexOf('합성동'),
      html.indexOf('</section>', html.indexOf('생활인구</h')),
    )
    expect(card).toContain('관측일 24시간 생활인구의 시간당 평균이에요.')
    expect(card).toContain('출처: 서울시 행정동 내국인 생활인구')
  })
  it('renders common-denominator bars and the pooled mean instead of a median', () => {
    const data = fixture()
    const values = ['10', '20', '30', '100']
    data.sales.items = values.map((value, index) => ({
      ...data.sales.items[0],
      market_code: `311000${index}`,
      metric: { ...number(`${value}원`, value), unit: 'KRW_source_reported' },
      average_contribution: { status: 'included', reason: null },
    }))
    const contributions = ['2.5', '5', '7.5', '25'].map((value, index) => ({
      market_code: `311000${index}`,
      industry_code: 'CS100010',
      source_quarter: '20254',
      metric: {
        ...number(`${value}원/점포`, value),
        unit: 'KRW_source_reported_per_store',
        numerator: values[index],
        denominator: '4',
      },
    }))
    data.sales.per_store_average = {
      status: 'ready',
      primary_quarter: '20254',
      representative_method: 'pooled_sales_over_total_stores_v1',
      graph_basis: 'each_sales_over_group_total_stores_v1',
      metric: { ...number('40원/점포', '40'), unit: 'KRW_source_reported_per_store' },
      contributions,
      total_sales: '160',
      total_store_count: '4',
      listed_item_count: 4,
      included_item_count: 4,
      excluded_counts: {},
      groups: [],
    }
    const html = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(html).toContain('분포를 표시할 자료가 없어요')
    expect(html).toContain('40원')
    expect(html).not.toContain('중앙값')
    expect(html).not.toContain('/점포')
  })
  it('keeps missing pooled values absent rather than falling back to median statistics', () => {
    const data = fixture()
    data.sales.per_store_average = {
      status: 'no_data',
      primary_quarter: '20254',
      metric: null,
      total_sales: null,
      total_store_count: null,
      listed_item_count: 1,
      included_item_count: 0,
      excluded_counts: {},
      groups: [],
    }
    const html = renderToStaticMarkup(<LocationReferenceView data={data} />)
    expect(html).toContain('자료 없음')
    expect(html).not.toContain('중앙값 기준')
  })
  it('uses the store-weighted median as the headline instead of pooled mean', () => {
    const data = fixture()
    const metric = (value: string) => ({
      ...number(`${value}원/점포`, value),
      unit: 'KRW_source_reported_per_store',
    })
    data.sales.items = ['500', '173'].map((count, index) => ({
      ...data.sales.items[0],
      market_code: `311000${index}`,
      metric: {
        ...number(index === 0 ? '50,000원' : '155,700원', index === 0 ? '50000' : '155700'),
        unit: 'KRW_source_reported',
      },
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
    expect(html).toContain('점포 수 기준 매출 분포')
    expect(html.indexOf('100원')).toBeLessThan(html.indexOf('306원'))
    expect(html).toContain('점포 수 가중 중앙값 100원')
  })
})
