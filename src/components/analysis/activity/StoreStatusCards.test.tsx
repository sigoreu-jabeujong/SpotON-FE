import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { MarketActivity } from '../../../types/market'
import StoreStatusCards from './StoreStatusCards'

function activity(by: MarketActivity['by_sub_category']): MarketActivity {
  return {
    recent_12m: { period: '(2025-11-08, 2026-11-08]', opened: 7, closed: 9 },
    yearly_trend: [],
    by_sub_category: by,
    sales: null,
    living_pop: null,
    flags: { missing: [] },
  }
}
const risk = { data: undefined, isPending: false, isError: false }
const avgCard = (html: string) => html.slice(html.indexOf('평균 영업 기간'))
/** 하위 안내 컴포넌트가 주소 조건을 읽으므로 라우터 안에서 그린다 */
const render = (el: ReactElement) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={['/result/analysis?category=cafe']}>{el}</MemoryRouter>,
  )

describe('점포 현황 — 평균 영업 기간 카드', () => {
  it('업종이 하나면 큰 숫자 하나만 (업종 이름·보조 줄 없음)', () => {
    const html = render(
      <StoreStatusCards
        activity={activity([{ sub_category: 'cafe', open_count: 39, avg_operating_months: 83 }])}
        risk={risk}
      />,
    )
    const card = avgCard(html)
    expect(card).toContain('6년 11개월')
    expect(card).not.toContain('카페')
    expect(card).not.toContain('기준 시점까지 경과 기간 평균')
    // 정의는 ⓘ 버튼으로
    expect(card).toContain('평균 영업 기간 설명 보기')
  })

  it('음식점 세부 업종이 여러 개면 서버 값을 업종별로 따로 (FE에서 평균 내지 않음)', () => {
    const html = render(
      <StoreStatusCards
        activity={activity([
          { sub_category: 'korean', open_count: 135, avg_operating_months: 140 },
          { sub_category: 'japanese', open_count: 49, avg_operating_months: 62 },
          { sub_category: 'western', open_count: 32, avg_operating_months: 94 },
        ])}
        risk={risk}
      />,
    )
    const card = avgCard(html)
    for (const text of ['한식', '11년 8개월', '일식', '5년 2개월', '양식', '7년 10개월'])
      expect(card).toContain(text)
  })

  it('동종업체 수 카드에 Spot:ON 참고지표 배지가 없다', () => {
    const html = render(
      <StoreStatusCards
        activity={activity([{ sub_category: 'cafe', open_count: 39, avg_operating_months: 83 }])}
        risk={risk}
      />,
    )
    expect(html).not.toContain('Spot:ON 참고지표')
  })
})
