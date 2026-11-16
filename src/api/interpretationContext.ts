import type { ApiMeta, CommonQueryParams } from '../types/api'
import type { ApiResult } from './client'
import type { RiskInterpretation } from '../types/risk'
import { RESTAURANT_SUB_CATEGORIES } from '../constants/diagnosis'
import { V2_API_ENABLED } from './analysisProfile'

function populationContractMatches(result: ApiResult<RiskInterpretation>): boolean {
  const version = result.meta?.prompt_version
  const p = result.data.evidence?.population_reference
  if (
    !['analysis-risk-interpret-v3', 'chain-risk-interpret-v2'].includes(version ?? '') ||
    !p ||
    typeof p !== 'object'
  )
    return false
  if (
    p.analysis_date !== result.meta?.as_of ||
    p.population_filter_applied !== false ||
    p.source_validation_performed !== false ||
    p.population_total_validated !== false ||
    !Array.isArray(p.sources)
  )
    return false
  if (p.status === 'no_data')
    return (
      p.reason === 'no_observation_in_period' &&
      p.observation_date === null &&
      p.sources.length === 0
    )
  if (
    typeof p.observation_date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(p.observation_date) ||
    p.observation_date < p.analysis_date.slice(0, 7) + '-01' ||
    p.observation_date > p.analysis_date
  )
    return false
  if (p.status === 'pending' || p.status === 'not_supported')
    return (
      p.sources.length === 0 &&
      p.reason === (p.status === 'pending' ? 'ambiguous_source_version' : 'scope_too_large')
    )
  return (
    p.status === 'ready' &&
    p.reason === null &&
    p.sources.length === 3 &&
    p.sources.every(
      (s, i) =>
        s &&
        s.source === ['local', 'long', 'short'][i] &&
        (s.status === 'partial'
          ? !!s.metrics
          : ['no_data', 'not_supported'].includes(s.status) && s.metrics === null),
    )
  )
}

export function riskBaseline(meta?: ApiMeta | null) {
  return meta
    ? { as_of: meta.as_of, data_updated_at: meta.data_updated_at, data_version: meta.data_version }
    : null
}

export function hasRiskBaseline(_params: CommonQueryParams, meta?: ApiMeta | null): boolean {
  return !!meta?.as_of && !!meta.data_updated_at && !!meta.data_version
}

export function interpretationMatches(
  result: ApiResult<RiskInterpretation>,
  params: CommonQueryParams,
  baseline?: ApiMeta | null,
): boolean {
  const meta = result.meta
  const evidence = result.data.evidence
  const filters = evidence?.filters
  if (
    !baseline?.as_of ||
    !baseline.data_updated_at ||
    !meta ||
    !evidence ||
    !filters ||
    typeof filters !== 'object' ||
    Array.isArray(filters)
  )
    return false
  const categories = params.sub_category?.length
    ? params.sub_category
    : params.category === 'cafe'
      ? ['cafe']
      : RESTAURANT_SUB_CATEGORIES.map((v) => v.id)
  const subs = evidence.sub_category
  const prose = result.data.body?.split(/\n\s*\n/).filter((text) => text.trim()) ?? []
  return (
    evidence.category === params.category &&
    evidence.radius_m === (params.radius ?? 500) &&
    ('area' in filters && filters.area) === (params.area ?? 'all') &&
    ('include_unknown_area' in filters && filters.include_unknown_area) ===
      (params.include_unknown_area ?? true) &&
    Array.isArray(subs) &&
    [...subs].sort().join(',') === [...categories].sort().join(',') &&
    meta.as_of === baseline.as_of &&
    meta.data_updated_at === baseline.data_updated_at &&
    evidence.as_of === baseline.as_of &&
    evidence.data_updated_at === baseline.data_updated_at &&
    result.data.verification.passed === true &&
    prose.length === 4 &&
    result.data.paragraphs?.length === 4 &&
    prose.every((text, index) => text.trim() === result.data.paragraphs?.[index].text.trim()) &&
    (!V2_API_ENABLED || populationContractMatches(result)) &&
    /^[0-9a-f]{64}$/.test(meta.context_hash ?? '') &&
    /^[0-9a-f]{64}$/.test(meta.data_version_hash ?? '') &&
    /^[0-9a-f]{64}$/.test(meta.prompt_sha256 ?? '')
  )
}
