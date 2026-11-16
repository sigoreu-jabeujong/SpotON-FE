import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type {
  LocationReference,
  ReferenceNumber,
  SalesReferenceItem,
  StoreWeightedDistribution,
} from '../../../types/locationReference'
import SalesDistributionChart from './SalesDistributionChart'

const number = (value: string): ReferenceNumber => ({
  value,
  display: `${value}원/점포`,
  unit: 'KRW_source_reported_per_store',
  rounded: false,
  exact_zero: value === '0',
})
function fixture() {
  const counts = ['500', '100', '73'],
    values = ['100', '200', '1000'],
    sales = ['50000', '20000', '73000']
  const items: SalesReferenceItem[] = counts.map((count, index) => ({
    market_code: `311000${index}`,
    market_name: `상권${index}`,
    industry_code: 'CS100010',
    industry_name: '커피',
    source_quarter: '20254',
    spatial_relation: 'contains_point',
    temporal_relation: 'earlier_reference',
    metric: { ...number(sales[index]), unit: 'KRW_source_reported', display: `${sales[index]}원` },
    per_store_metric: number(values[index]),
    store_reference: { total_stores: count, reason: null },
    average_contribution: { status: 'included', reason: null },
    status: 'ready',
    reason: null,
  }))
  const d: StoreWeightedDistribution = {
    method: 'store_weighted_median_v1',
    model: 'repeat_market_mean_for_each_reference_store',
    individual_store_sales_observed: false,
    total_store_count: '673',
    reference_count: 3,
    median: number('100'),
    mean: number('212.48'),
    minimum: number('100'),
    maximum: number('1000'),
    variance: {
      value: '77777',
      unit: 'KRW_source_reported_per_store_squared',
      scope: 'between_market_per_store_means',
    },
    bin_method: 'equal_width_exact_fraction_v1',
    bins: [
      { lower: number('100'), upper: number('400'), store_count: '600', upper_inclusive: false },
      { lower: number('400'), upper: number('700'), store_count: '0', upper_inclusive: false },
      { lower: number('700'), upper: number('1000'), store_count: '73', upper_inclusive: true },
    ],
  }
  const average: NonNullable<LocationReference['sales']['per_store_average']> = {
    status: 'ready',
    primary_quarter: '20254',
    representative_method: 'store_weighted_median_v1',
    graph_basis: 'store_weighted_histogram_v1',
    metric: number('212.48'),
    total_sales: '143000',
    total_store_count: '673',
    listed_item_count: 3,
    included_item_count: 3,
    excluded_counts: {},
    groups: [],
    store_weighted_distribution: d,
  }
  return { items, average, d }
}
describe('store weighted estimated sales histogram', () => {
  it('shows 673 store weights, weighted median and model definition instead of contribution bars', () => {
    const p = fixture()
    const html = renderToStaticMarkup(
      <SalesDistributionChart items={p.items} average={p.average} />,
    )
    expect(html).toContain('673개 점포')
    expect(html).toContain('점포 수 가중 중앙값 100원')
    expect(html).toContain('점포 수 가중치 600개')
    expect(html).toContain('점포 수 가중치 73개')
    expect(html).toContain('개별 점포 실매출을 관측한 분포는 아니에요')
    expect(html).toContain('height:0%')
    expect(html).not.toContain('각 상권 매출 ÷ 전체')
    expect((html.match(/type="button"/g) ?? []).length).toBe(3)
  })
  it('rejects mismatched histogram mass, source weights, units or model metadata', () => {
    for (const tamper of ['mass', 'source', 'unit', 'method', 'range']) {
      const p = fixture()
      if (tamper === 'mass') p.d.bins[0].store_count = '601'
      if (tamper === 'source') p.items[0].store_reference!.total_stores = '501'
      if (tamper === 'unit') p.d.median.unit = 'people'
      if (tamper === 'method') p.average.graph_basis = 'each_sales_over_group_total_stores_v1'
      if (tamper === 'range') p.d.median.value = '2000'
      expect(
        renderToStaticMarkup(<SalesDistributionChart items={p.items} average={p.average} />),
      ).toContain('분포를 표시할 자료가 없어요')
    }
  })
  it('keeps an all-zero point mass with real store weights and no division by zero', () => {
    const p = fixture()
    p.d.minimum = p.d.maximum = p.d.median = number('0')
    p.d.bins = [
      { lower: number('0'), upper: number('0'), store_count: '673', upper_inclusive: true },
    ]
    const html = renderToStaticMarkup(
      <SalesDistributionChart items={p.items} average={p.average} />,
    )
    expect(html).toContain('점포 수 가중 중앙값 0원')
    expect(html).toContain('height:100%')
    expect(html).toContain('left:50%')
    expect(html).not.toContain('NaN')
  })
})
