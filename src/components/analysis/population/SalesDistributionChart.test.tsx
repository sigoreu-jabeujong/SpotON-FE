import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { LocationReference, SalesReferenceItem } from '../../../types/locationReference'
import SalesDistributionChart from './SalesDistributionChart'

function fixture() {
  const metric = (value: string, numerator: string, denominator: string) => ({
    value,
    numerator,
    denominator,
    display: `${value}원/점포`,
    unit: 'KRW_source_reported_per_store',
    rounded: false,
    exact_zero: value === '0',
  })
  const items: SalesReferenceItem[] = ['100', '900'].map((value, index) => ({
    market_code: `311000${index}`,
    market_name: `상권${index}`,
    industry_code: 'CS100010',
    industry_name: '커피',
    source_quarter: '20254',
    spatial_relation: 'contains_point',
    temporal_relation: 'earlier_reference',
    metric: { ...metric(value, value, '1'), display: `${value}원`, unit: 'KRW_source_reported' },
    average_contribution: { status: 'included', reason: null },
    status: 'ready',
    reason: null,
  }))
  const average: NonNullable<LocationReference['sales']['per_store_average']> = {
    status: 'ready',
    primary_quarter: '20254',
    representative_method: 'pooled_sales_over_total_stores_v1',
    graph_basis: 'each_sales_over_group_total_stores_v1',
    metric: metric('25', '1000', '40'),
    total_sales: '1000',
    total_store_count: '40',
    listed_item_count: 2,
    included_item_count: 2,
    excluded_counts: {},
    groups: [],
    contributions: items.map((i, index) => ({
      market_code: i.market_code,
      industry_code: i.industry_code,
      source_quarter: '20254',
      metric: metric(index === 0 ? '2.5' : '22.5', index === 0 ? '100' : '900', '40'),
    })),
  }
  return { items, average }
}
describe('common total store denominator graph', () => {
  it('uses rounded server bar labels while preserving the server overall mean', () => {
    const props = fixture()
    props.average.contributions![0].metric.display = '3원/점포'
    props.average.contributions![1].metric.display = '23원/점포'
    const html = renderToStaticMarkup(<SalesDistributionChart {...props} />)
    expect(html).toContain('3원')
    expect(html).toContain('23원')
    expect(html).toContain('전체 평균 25원')
    expect(html).not.toContain('전체 평균 26원')
  })
  it('plots each source sales over 40 total stores, with a 25 total mean', () => {
    const props = fixture()
    const html = renderToStaticMarkup(<SalesDistributionChart {...props} />)
    expect(html).toContain('평균 추정 매출 그래프')
    expect(html).toContain('전체 40개 점포')
    expect(html).toContain('2.5원')
    expect(html).toContain('22.5원')
    expect(html).toContain('전체 평균 25원')
    expect(html).toContain('width:10%')
    expect(html).toContain('width:90%')
    expect(html).not.toContain('중앙값')
    expect(html).not.toContain('/점포')
  })
  it('rejects an individual denominator, missing source, duplicate or mixed quarter', () => {
    for (const mutation of ['denominator', 'missing', 'duplicate', 'quarter', 'unit']) {
      const props = fixture()
      if (mutation === 'denominator') props.average.contributions![0].metric.denominator = '10'
      if (mutation === 'missing') props.items.pop()
      if (mutation === 'duplicate')
        props.average.contributions![1] = props.average.contributions![0]
      if (mutation === 'quarter') props.items[0].source_quarter = '20253'
      if (mutation === 'unit') props.average.contributions![0].metric.unit = 'people'
      expect(renderToStaticMarkup(<SalesDistributionChart {...props} />)).toContain(
        '그래프를 표시할 자료가 없어요',
      )
    }
  })
  it('renders real zero contributions without dividing by zero', () => {
    const props = fixture()
    props.average.metric!.value = '0'
    props.average.metric!.display = '0원/점포'
    props.average.total_sales = '0'
    props.items.forEach((i) => {
      i.metric!.value = '0'
      i.metric!.display = '0원'
    })
    props.average.contributions!.forEach((c) => {
      c.metric.value = '0'
      c.metric.numerator = '0'
      c.metric.display = '0원/점포'
    })
    const html = renderToStaticMarkup(<SalesDistributionChart {...props} />)
    expect(html).toContain('전체 평균 0원')
    expect(html).toContain('width:0%')
    expect(html).not.toContain('NaN')
  })
})
