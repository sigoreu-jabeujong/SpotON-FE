import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type {
  ReferenceNumber,
  SalesDistribution,
  SalesReferenceItem,
} from '../../../types/locationReference'
import SalesDistributionChart from './SalesDistributionChart'

const number = (value: string): ReferenceNumber => ({
  value,
  display: `${value}원/점포`,
  unit: 'KRW_source_reported_per_store',
  rounded: true,
  exact_zero: value === '0',
})
const item = (
  code: string,
  value: string | null,
  status = 'included',
  quarter = '20254',
): SalesReferenceItem => ({
  market_code: code,
  market_name: `상권${code}`,
  industry_code: 'CS100010',
  industry_name: '커피',
  spatial_relation: 'contains_point',
  source_quarter: quarter,
  temporal_relation: 'later_reference',
  metric: null,
  per_store_metric: value === null ? null : number(value),
  average_contribution: { status, reason: null },
  status: 'ready',
  reason: null,
})
const distribution = (): SalesDistribution => ({
  sample_count: 4,
  limited_reference_count: false,
  median: number('25'),
  q1: number('15'),
  q3: number('65'),
  iqr: number('50'),
  variance: { value: '1250', unit: 'KRW_source_reported_per_store_squared' },
})

describe('source sales distribution graph', () => {
  it('plots only included rows from the primary quarter and keeps server statistics and labels', () => {
    const html = renderToStaticMarkup(
      <SalesDistributionChart
        quarter="20254"
        distribution={distribution()}
        items={[
          item('1', '10'),
          item('2', '20'),
          item('3', '30'),
          item('4', '100'),
          item('excluded', '99999', 'excluded'),
          item('old', '88888', 'different_quarter', '20253'),
        ]}
      />,
    )
    expect(html).toContain('매출 분산 그래프')
    expect(html).toContain('left:25%')
    expect(html).toContain('left:15%;width:50%')
    expect(html).toContain('중간 50% 범위')
    expect(html).toContain('분산(원²): 1250')
    expect(html).not.toContain('99999')
    expect(html).not.toContain('88888')
    expect(html).not.toContain('/점포')
    expect(html).not.toContain('표시 반올림')
    expect((html.match(/type="button"/g) ?? []).length).toBe(4)
    expect((html.match(/tabindex="0"/g) ?? []).length).toBe(1)
  })
  it('preserves real zeros while hiding small sample spread estimates', () => {
    const d = distribution()
    d.sample_count = 1
    d.limited_reference_count = true
    d.median = d.q1 = d.q3 = number('0')
    const html = renderToStaticMarkup(
      <SalesDistributionChart quarter="20254" distribution={d} items={[item('zero', '0')]} />,
    )
    expect(html).toContain('모든 항목 0원')
    expect(html).toContain('left:50%')
    expect(html).not.toContain('NaN')
    expect(html).not.toContain('분산(원²)')
    expect(html).not.toContain('중간 50% 범위')
  })
  it('does not turn missing, nonfinite or inconsistent data into zero dots', () => {
    for (const value of [null, '', 'Infinity', '-1', '0x10', '1e3', ' 12 ', '0b1']) {
      const d = distribution()
      d.sample_count = 1
      const html = renderToStaticMarkup(
        <SalesDistributionChart
          quarter="20254"
          distribution={d}
          items={[item('missing', value)]}
        />,
      )
      expect(html).toContain('분포를 표시할 자료가 없어요')
      expect(html).not.toContain('type="button"')
    }
    const html = renderToStaticMarkup(
      <SalesDistributionChart
        quarter="20254"
        distribution={distribution()}
        items={[item('only', '10')]}
      />,
    )
    expect(html).toContain('분포를 표시할 자료가 없어요')
  })
  it('keeps huge exact display strings even when coordinates use floating point', () => {
    const d = distribution()
    d.sample_count = 1
    d.limited_reference_count = true
    d.median = d.q1 = d.q3 = number('9007199254740993')
    const html = renderToStaticMarkup(
      <SalesDistributionChart
        quarter="20254"
        distribution={d}
        items={[item('huge', '9007199254740993')]}
      />,
    )
    expect(html).toContain('9007199254740993원')
    expect(html).toContain('left:100%')
  })
  it('sorts keyboard targets in visual amount order and rejects mixed units', () => {
    const rows = [item('high', '100'), item('low', '10'), item('mid2', '30'), item('mid1', '20')]
    const html = renderToStaticMarkup(
      <SalesDistributionChart quarter="20254" distribution={distribution()} items={rows} />,
    )
    expect(html.indexOf('title="상권low')).toBeLessThan(html.indexOf('title="상권high'))
    rows[0].per_store_metric!.unit = 'estimated_people_hourly_mean'
    expect(
      renderToStaticMarkup(
        <SalesDistributionChart quarter="20254" distribution={distribution()} items={rows} />,
      ),
    ).toContain('분포를 표시할 자료가 없어요')
  })
  it('hides small-sample bands even when the flag contradicts the count and handles four zeros', () => {
    const d = distribution()
    d.sample_count = 1
    d.limited_reference_count = false
    d.median = d.q1 = d.q3 = number('0')
    const one = renderToStaticMarkup(
      <SalesDistributionChart quarter="20254" distribution={d} items={[item('one', '0')]} />,
    )
    expect(one).not.toContain('중간 50% 범위')
    d.sample_count = 4
    const four = renderToStaticMarkup(
      <SalesDistributionChart
        quarter="20254"
        distribution={d}
        items={['1', '2', '3', '4'].map((code) => item(code, '0'))}
      />,
    )
    expect(four).toContain('모든 항목 0원')
    expect(four).toContain('width:0%')
    expect(four).not.toContain('NaN')
  })
})
