import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { populationFixture } from '../../../api/mocks/populationFixture'
import type { PopulationReference, PublicNumber } from '../../../types/population'
import PopulationReferenceView from './PopulationReferenceView'
import { publicNumberText } from './populationDisplay'

describe('population partial reference display', () => {
  it('shows source-specific values, scope and limitations without claiming people counts', () => {
    const html = renderToStaticMarkup(<PopulationReferenceView data={populationFixture.data} />)
    expect(html).toContain('내국인 공개자료 주야간 비교 (부분)')
    expect(html).toContain('장기체류 외국인')
    expect(html).toContain('단기체류 외국인')
    expect(html).toContain('2.00000배')
    expect(html).toContain('66.7%')
    expect(html).toContain('전체 인구를 대표하지 않아요')
    expect(html).toContain('인원수 아님')
    expect(html).toContain('2026-11-07')
    expect(html).not.toContain('2.00000명')
  })

  it('preserves actual zero, rounded positive zero and null arithmetic distinctly', () => {
    const value: PublicNumber = {
      value: '0.00000',
      display: '0.00000배',
      exact_zero: true,
      rounded: false,
      unit: 'ratio',
      reason: null,
    }
    expect(publicNumberText(value)).toBe('0.00000배')
    expect(publicNumberText({ ...value, exact_zero: false, rounded: true })).toContain(
      '0에 가까운 값',
    )
    expect(
      publicNumberText({
        ...value,
        value: null,
        display: null,
        exact_zero: null,
        rounded: null,
        reason: 'zero_night_denominator',
      }),
    ).toContain('야간 공개자료 값이 0')
  })

  it('never substitutes a foreign result into the domestic card', () => {
    const data: PopulationReference = structuredClone(populationFixture.data)
    data.sources[1] = { ...data.sources[0], source: 'long' }
    data.sources[0] = {
      ...data.sources[0],
      status: 'no_data',
      reason: 'no_common_public_components',
      values: null,
    }
    const html = renderToStaticMarkup(<PopulationReferenceView data={data} />)
    const domestic = html
      .split('data-population-source="local"')[1]
      .split('data-population-source="long"')[0]
    expect(domestic).toContain('동일 구성이 없어')
    expect(domestic).not.toContain('2.00000배')
    expect(html.split('data-population-source="long"')[1]).toContain('2.00000배')
  })

  it('reports same-month absence and source ambiguity without invented values', () => {
    const data: PopulationReference = {
      ...populationFixture.data,
      status: 'no_data',
      reason: 'no_observation_in_period',
      observation_date: null,
      sources: [],
    }
    const html = renderToStaticMarkup(<PopulationReferenceView data={data} compact />)
    expect(html).toContain('기준월에 비교할 관측 자료가 없어요')
    expect(html).not.toContain('2.00000배')
    expect(html).not.toContain('<details')
  })

  it('shows exclusion bias and preserves high-precision server display strings', () => {
    const data: PopulationReference = structuredClone(populationFixture.data)
    const local = data.sources[0]
    local.limitations.push('exclusion_pattern_may_bias_ratio')
    local.quality.excluded_by_hour_class.night_only = 2
    local.values!.day_source_sum.display = '11,999,999,999,999,999.99988'
    const html = renderToStaticMarkup(<PopulationReferenceView data={data} />)
    expect(html).toContain('야간에만 있는 구성 2개가 제외돼')
    expect(html).toContain('11,999,999,999,999,999.99988')
  })
})
