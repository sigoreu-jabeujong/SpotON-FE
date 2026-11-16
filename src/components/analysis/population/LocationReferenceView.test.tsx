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
    expect(html).toContain('점포 1개당 평균 추정매출')
    expect(html).toContain('250,000원/점포')
    expect(html).toContain('10000000')
    expect(html).toContain('중복 포함될 수 있어요')
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
})
