import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { showAtOnce, useInViewOnce } from './useInViewOnce'

function Probe() {
  const [ref, shown] = useInViewOnce<HTMLDivElement>()
  return <div ref={ref}>{shown ? 'shown' : 'waiting'}</div>
}

describe('useInViewOnce — 화면에 처음 보이면 한 번', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('IntersectionObserver가 없는 환경(서버 렌더·테스트)에서는 처음부터 true', () => {
    expect(showAtOnce()).toBe(true)
    expect(renderToStaticMarkup(<Probe />)).toContain('shown')
  })

  it('관찰할 수 있으면 기다리고, 동작 줄이기·인쇄면 처음부터 true', () => {
    vi.stubGlobal('IntersectionObserver', class {})
    const matches = { reduce: false, print: false }
    vi.stubGlobal('window', {
      matchMedia: (q: string) => ({
        matches: q.includes('reduce') ? matches.reduce : q === 'print' && matches.print,
      }),
    })
    expect(showAtOnce()).toBe(false)
    matches.reduce = true
    expect(showAtOnce()).toBe(true)
    matches.reduce = false
    matches.print = true
    expect(showAtOnce()).toBe(true)
  })
})
