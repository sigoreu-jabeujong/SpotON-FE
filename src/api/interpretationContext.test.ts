import { describe, expect, it, vi } from 'vitest'
import type { ApiResult } from './client'
import type { ApiMeta, CommonQueryParams } from '../types/api'
import type { RiskInterpretation } from '../types/risk'
vi.mock('./analysisProfile', () => ({ V2_API_ENABLED: true }))
import { hasRiskBaseline, interpretationMatches } from './interpretationContext'

const params: CommonQueryParams = { lat: 37.5, lng: 127, category: 'cafe' }
const baseline: ApiMeta = {
  as_of: '2026-10-31',
  data_updated_at: '2026-10-31',
  data_version: { stores_batch_ids: ['synthetic'] },
}
function response(): ApiResult<RiskInterpretation> {
  const paragraphs = ['가', '나', '다', '라'].map((text) => ({ text, indicator_ids: [] }))
  return {
    meta: {
      ...baseline,
      prompt_version: 'analysis-risk-interpret-v3',
      context_hash: 'a'.repeat(64),
      data_version_hash: 'b'.repeat(64),
      prompt_sha256: 'c'.repeat(64),
    },
    data: {
      label: 'AI 해석',
      body: paragraphs.map((p) => p.text).join('\n\n'),
      paragraphs,
      official_values: [],
      favorable: [],
      unfavorable: [],
      missing_data: [],
      checklist: [],
      model: 'synthetic',
      generated_at: '2026-11-17T00:00:00Z',
      verification: { passed: true, checked_numbers: 0, mismatches: [], regenerated: false },
      evidence: {
        category: 'cafe',
        sub_category: ['cafe'],
        radius_m: 500,
        filters: { area: 'all', include_unknown_area: true },
        as_of: baseline.as_of!,
        data_updated_at: baseline.data_updated_at!,
        population_reference: {
          status: 'no_data',
          reason: 'no_observation_in_period',
          analysis_date: baseline.as_of!,
          observation_date: null,
          calculation_method: 'fixed_public_component_24h',
          day_hours: '06-17',
          night_hours: '00-05,18-23',
          ratio_definition: 'pooled_day_sum_over_pooled_night_sum',
          population_filter_applied: false,
          source_validation_performed: false,
          population_total_validated: false,
          sources: [],
        },
      },
    },
  }
}
describe('브랜드 판정 제거 후 AI 문맥 검증 보존', () => {
  it('브랜드 메타 없이 동일한 조건/날짜/부분인구/문단 검증 결과를 받는다', () => {
    expect(hasRiskBaseline(params, baseline)).toBe(true)
    expect(interpretationMatches(response(), params, baseline)).toBe(true)
  })
  it('기준일·조건·본문·프롬프트·인구 관측 계약이 달라지면 거부한다', () => {
    expect(interpretationMatches(response(), { ...params, radius: 1000 }, baseline)).toBe(false)
    for (const change of [
      (r: ApiResult<RiskInterpretation>) => {
        r.meta!.as_of = '2025-01-31'
      },
      (r: ApiResult<RiskInterpretation>) => {
        r.data.body = '다른 문장'
      },
      (r: ApiResult<RiskInterpretation>) => {
        r.meta!.prompt_version = 'unexpected'
      },
      (r: ApiResult<RiskInterpretation>) => {
        r.data.evidence!.population_reference!.analysis_date = '2025-01-31'
      },
    ]) {
      const r = response()
      change(r)
      expect(interpretationMatches(r, params, baseline)).toBe(false)
    }
  })
  it('단계별 배포 중 이전 프롬프트도 동일한 일반 분석 근거일 때만 허용한다', () => {
    const r = response()
    r.meta!.prompt_version = 'chain-risk-interpret-v2'
    expect(interpretationMatches(r, params, baseline)).toBe(true)
  })
})
