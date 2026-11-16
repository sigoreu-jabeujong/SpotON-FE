import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { AiPopulationReference } from '../../../types/aiPopulation'
import AiPopulationInfo from './AiPopulationInfo'
import { evidenceChip } from './evidenceChip'

const missing: AiPopulationReference = {
  status: 'no_data',
  reason: 'no_observation_in_period',
  analysis_date: '2026-10-31',
  observation_date: null,
  calculation_method: 'fixed_public_component_24h',
  day_hours: '06-17',
  night_hours: '00-05,18-23',
  ratio_definition: 'pooled_day_sum_over_pooled_night_sum',
  population_filter_applied: false,
  source_validation_performed: false,
  population_total_validated: false,
  sources: [],
}
const quality = {
  selected_grid_count: 2,
  used_grid_count: 0,
  grids_without_rows: 1,
  candidate_component_count: 1,
  used_component_count: 0,
  excluded_component_count: 1,
  excluded_by_hour_class: { day_only: 0, night_only: 0, both: 1 },
}

describe('AI population evidence compatibility', () => {
  it('adds no population evidence when the older BE has none', () => {
    expect(renderToStaticMarkup(<AiPopulationInfo />)).toBe('')
  })
  it('keeps AI observation date and unavailable month without numeric claims', () => {
    const html = renderToStaticMarkup(<AiPopulationInfo data={missing} />)
    expect(html).toContain('2026-10-31')
    expect(html).toContain('관측일 자료 없음')
    expect(html).toContain('선택 기준월에 비교할 관측 자료가 없어요')
    expect(html).toContain('전체 생활인구는 미확정')
    expect(html).not.toContain('%')
  })
  it('keeps source-specific status and the POST date independently of GET cards', () => {
    const data: AiPopulationReference = {
      ...missing,
      status: 'ready',
      reason: null,
      analysis_date: '2026-11-08',
      observation_date: '2026-11-07',
      sources: [
        {
          source: 'local',
          status: 'no_data',
          reason: 'no_common_public_components',
          metrics: null,
          quality,
          limitations: ['not_population_total'],
        },
        {
          source: 'long',
          status: 'partial',
          reason: 'public_subset_only',
          metrics: {
            day_share_pct: {
              display: '66.7%',
              exact_zero: false,
              rounded: true,
              unit: 'pct_of_public_subset',
              reason: null,
            },
            night_share_pct: {
              display: '33.3%',
              exact_zero: false,
              rounded: true,
              unit: 'pct_of_public_subset',
              reason: null,
            },
            day_night_ratio: {
              display: '2.00000배',
              exact_zero: false,
              rounded: false,
              unit: 'ratio',
              reason: null,
            },
          },
          quality: {
            ...quality,
            used_grid_count: 1,
            used_component_count: 1,
            excluded_component_count: 0,
            excluded_by_hour_class: { day_only: 0, night_only: 0, both: 0 },
          },
          limitations: ['not_population_total'],
        },
        {
          source: 'short',
          status: 'no_data',
          reason: 'no_common_public_components',
          metrics: null,
          quality,
          limitations: ['not_population_total'],
        },
      ],
    }
    const html = renderToStaticMarkup(<AiPopulationInfo data={data} />)
    expect(html).toContain('2026-11-07')
    expect(html).toContain('내국인: 모든 시간에 공개된 동일 구성이 없어요')
    expect(html).toContain('장기체류 외국인: 공개된 동일 구성의 부분 비교')
    expect(html).toContain('서울시 생활인구 250m 격자 공개자료(R4)')
    expect(html).toContain('전체 인구·실제 방문객을 대표하지 않아요')
  })
  it.each([
    ['pending', 'ambiguous_source_version', '자료 버전을 확인 중'],
    ['not_supported', 'scope_too_large', '자료량을 넘어요'],
  ] as const)('renders %s separately from errors', (status, reason, text) => {
    expect(
      renderToStaticMarkup(<AiPopulationInfo data={{ ...missing, status, reason }} />),
    ).toContain(text)
  })
  it('names the new evidence without navigating to a Risk indicator', () => {
    expect(evidenceChip('population_public_subset')).toEqual({
      label: '공개자료 주야간 비교 상태',
      target: null,
    })
  })
})
