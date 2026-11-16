import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { locationReferenceFixture } from '../../../api/mocks/locationReference'
import LocationReferenceView from './LocationReferenceView'
import LocationReferencePrint from './LocationReferencePrint'

describe('restaurant market aggregates', () => {
  for (const Component of [LocationReferenceView, LocationReferencePrint]) {
    it(`${Component.name} renders three distinct market cards and the pooled estimate`, () => {
      const data = locationReferenceFixture()
      const html = renderToStaticMarkup(<Component category="restaurant" data={data} />)
      expect(html.match(/data-testid="restaurant-market"/g)).toHaveLength(3)
      expect(html).toContain('1,387,097원')
      expect(html).toContain(
        '합성상권2 · 합성상권0 · 합성상권3 상권의 매출액을 토대로 추정했습니다.',
      )
      expect(html).toContain('430,000,000원 ÷ 점포 수 합계 310개')
      expect(html).toContain('선택 업종: 한식 · 중식 · 일식 · 양식 합산')
      expect(html).toContain('나머지 상권 보기 (1곳)')
      expect(html).toContain('업종별 원자료')
      expect(html).not.toContain('/점포')
    })
  }
  it('changes selection and rank with the chosen industries', () => {
    const data = locationReferenceFixture(['korean', 'chinese'])
    const html = renderToStaticMarkup(<LocationReferenceView category="restaurant" data={data} />)
    expect(html).toContain('합성상권1 · 합성상권0 · 합성상권2 상권의 매출액을 토대로 추정했습니다.')
    expect(html).toContain('선택 업종: 한식 · 중식 합산')
    expect(html).toContain('1,148,148원')
    expect(html).not.toContain('일식음식점')
  })
  it('discloses selected partial coverage at both headline and market level', () => {
    const html = renderToStaticMarkup(
      <LocationReferenceView
        category="restaurant"
        data={locationReferenceFixture([], 'partial')}
      />,
    )
    expect(html).toContain('선택 4종 중 3종 합산')
    expect(html).toContain('일부 상권은 선택 업종 일부만 합산했어요.')
    expect(html).toContain('한식 (점포 수 자료 없음)')
  })
  it('shows a reason for no data and never invents a zero', () => {
    const html = renderToStaticMarkup(
      <LocationReferenceView
        category="restaurant"
        data={locationReferenceFixture([], 'no_data')}
      />,
    )
    expect(html).toContain('매출 원자료가 연결되지 않았어요.')
    expect(html).not.toContain('data-testid="restaurant-market"')
    expect(html).not.toContain('0원')
  })
  it('keeps legacy data in a collapsed audit when the new projection is missing or null', () => {
    for (const value of [undefined, null]) {
      const data = locationReferenceFixture()
      data.sales.market_aggregation = value
      const html = renderToStaticMarkup(<LocationReferenceView category="restaurant" data={data} />)
      expect(html).toContain('상권별 합산 자료를 현재 제공할 수 없어요.')
      expect(html).not.toContain('data-testid="restaurant-market"')
      expect(html).toContain('업종별 원자료')
    }
  })
  it('does not dispatch cafe into restaurant rendering', () => {
    const html = renderToStaticMarkup(
      <LocationReferenceView category="cafe" data={locationReferenceFixture([], 'cafe')} />,
    )
    expect(html).not.toContain('data-testid="restaurant-sales"')
  })
})
