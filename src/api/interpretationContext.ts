import type { ApiMeta, CommonQueryParams, V2QueryParams } from '../types/api'
import type { BrandFilters } from '../types/brands'
import type { ApiResult } from './client'
import type { RiskInterpretation } from '../types/risk'
import { RESTAURANT_SUB_CATEGORIES } from '../constants/diagnosis'

function populationContractMatches(result: ApiResult<RiskInterpretation>): boolean {
  const version = result.meta?.prompt_version
  const p = result.data.evidence?.population_reference
  if (version === 'chain-risk-interpret-v1') return p === undefined
  if (version !== 'chain-risk-interpret-v2' || !p || typeof p !== 'object') return false
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
    ? {
        as_of: meta.as_of,
        data_updated_at: meta.data_updated_at,
        data_version: meta.data_version,
        brand_classification: meta.brand_classification,
        brand_filters: meta.brand_filters,
      }
    : null
}

export function expectedBrandFilters(params: V2QueryParams): BrandFilters {
  return {
    brand_scope: params.brand_scope,
    brand_unknown: params.brand_unknown,
    brand_evidence: params.brand_evidence,
    brand_time_basis: 'observed_record',
    operation_type: 'any',
    area: params.area ?? 'all',
    include_unknown_area: params.include_unknown_area ?? true,
    sub_category: params.sub_category ?? [],
  }
}

function sameFilters(actual: BrandFilters | null | undefined, expected: BrandFilters) {
  if (!actual || !Array.isArray(actual.sub_category)) return false
  const { sub_category: a, ...fields } = actual
  const { sub_category: b, ...target } = expected
  return (
    Object.entries(target).every(([key, value]) => fields[key as keyof typeof fields] === value) &&
    [...a].sort().join(',') === [...b].sort().join(',')
  )
}

export function hasRiskBaseline(params: CommonQueryParams, meta?: ApiMeta | null): boolean {
  if (!params.brand_scope) return true
  const c = meta?.brand_classification
  return (
    !!meta?.as_of &&
    !!meta.data_updated_at &&
    !!meta.data_version &&
    !!c &&
    ['pending', 'estimate'].includes(c.status) &&
    typeof c.source_drift === 'boolean' &&
    (c.status === 'pending'
      ? c.generation === null
      : typeof c.generation === 'string' && !!c.generation) &&
    sameFilters(meta.brand_filters, expectedBrandFilters(params))
  )
}

/** Shared BE metadata only: data_version and data_version_hash are different contracts. */
export function interpretationMatches(
  result: ApiResult<RiskInterpretation>,
  params: CommonQueryParams,
  baseline?: ApiMeta | null,
): boolean {
  if (!params.brand_scope) return true
  const meta = result.meta
  const current = baseline?.brand_classification
  const returned = meta?.brand_classification
  if (
    !baseline?.as_of ||
    !baseline.data_updated_at ||
    !baseline.data_version ||
    !current ||
    !returned ||
    !meta ||
    !['pending', 'estimate'].includes(current.status) ||
    (current.status === 'estimate'
      ? typeof current.generation !== 'string' || !current.generation
      : current.generation !== null) ||
    typeof current.source_drift !== 'boolean'
  )
    return false
  const filters = expectedBrandFilters(params)
  const evidence = result.data.evidence
  const evidenceFilters = evidence?.filters
  const evidenceBrand = evidence?.brand_classification
  // Request metadata preserves [] for "all"; BE evidence expands supported categories.
  const evidenceCategories: BrandFilters['sub_category'] = params.sub_category?.length
    ? params.sub_category
    : params.category === 'cafe'
      ? ['cafe']
      : RESTAURANT_SUB_CATEGORIES.map((value) => value.id)
  if (
    !evidenceFilters ||
    typeof evidenceFilters !== 'object' ||
    Array.isArray(evidenceFilters) ||
    !evidenceBrand ||
    typeof evidenceBrand !== 'object' ||
    !('status' in evidenceBrand) ||
    evidenceBrand.status !== current.status ||
    !('source_drift' in evidenceBrand) ||
    evidenceBrand.source_drift !== current.source_drift ||
    evidence?.category !== params.category ||
    evidence?.radius_m !== (params.radius ?? 500) ||
    !sameFilters({ ...evidenceFilters, sub_category: evidence.sub_category } as BrandFilters, {
      ...filters,
      sub_category: evidenceCategories,
    })
  )
    return false
  const prose = result.data.body?.split(/\n\s*\n/).filter((text) => text.trim()) ?? []
  return (
    result.data.verification.passed === true &&
    !!result.data.body?.trim() &&
    result.data.paragraphs?.length === 4 &&
    prose.length === 4 &&
    prose.every((text, index) => text.trim() === result.data.paragraphs?.[index].text.trim()) &&
    meta.as_of === baseline.as_of &&
    meta.data_updated_at === baseline.data_updated_at &&
    result.data.evidence?.as_of === baseline.as_of &&
    result.data.evidence?.data_updated_at === baseline.data_updated_at &&
    returned.generation === current.generation &&
    returned.status === current.status &&
    returned.source_drift === current.source_drift &&
    sameFilters(meta.brand_filters, filters) &&
    sameFilters(baseline.brand_filters, filters) &&
    populationContractMatches(result) &&
    /^[0-9a-f]{64}$/.test(meta.context_hash ?? '') &&
    /^[0-9a-f]{64}$/.test(meta.data_version_hash ?? '') &&
    /^[0-9a-f]{64}$/.test(meta.prompt_sha256 ?? '')
  )
}
