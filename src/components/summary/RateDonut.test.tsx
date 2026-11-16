import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import RateDonut from './RateDonut'

const C = 2 * Math.PI * 42

describe('RateDonut — 채움 애니메이션', () => {
  it('IntersectionObserver가 없는 환경(서버 렌더·테스트)에서는 처음부터 서버 값만큼 채운다', () => {
    const html = renderToStaticMarkup(<RateDonut percent={25} />)
    expect(html).toContain(`stroke-dasharray:${0.25 * C} ${C}`)
    // 인쇄용 최종 값도 같은 값
    expect(html).toContain(`--donut-full:${0.25 * C} ${C}`)
    // 숫자는 카드 왼쪽에 크게 — 링은 그림이라 전체 aria-hidden
    expect(html).toContain('aria-hidden="true"')
  })

  it('값이 없으면(판단 보류) 파란 링 없이 회색 링만', () => {
    const html = renderToStaticMarkup(<RateDonut percent={null} />)
    expect(html).not.toContain('data-donut-fill')
    expect(html).toContain('stroke-gray-300')
  })
})
