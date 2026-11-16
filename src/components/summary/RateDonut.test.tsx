import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import RateDonut from './RateDonut'

const C = 2 * Math.PI * 42

describe('RateDonut — 채움 애니메이션', () => {
  it('IntersectionObserver가 없는 환경(서버 렌더·테스트)에서는 처음부터 서버 값만큼 채운다', () => {
    const html = renderToStaticMarkup(
      <RateDonut percent={25} text="25.0%" empty={{ status: 'fact', text: null }} />,
    )
    expect(html).toContain(`stroke-dasharray:${0.25 * C} ${C}`)
    // 인쇄용 최종 값도 같은 값
    expect(html).toContain(`--donut-full:${0.25 * C} ${C}`)
    // 가운데 숫자는 처음부터 최종 값
    expect(html).toContain('25.0%')
  })

  it('값이 없으면(판단 보류) 파란 링 없이 회색 링과 상태 글자', () => {
    const html = renderToStaticMarkup(
      <RateDonut
        percent={null}
        text={null}
        empty={{ status: 'pending', text: '표본이 적어 판단을 보류했어요.' }}
      />,
    )
    expect(html).not.toContain('data-donut-fill')
    expect(html).toContain('판단 보류')
  })
})
