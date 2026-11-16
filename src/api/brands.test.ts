import { describe, expect, it } from 'vitest'
import { parseAnalysisVersion } from '../config/analysisVersion'
import { parseDiagnosisQuery, toDiagnosisSearch } from '../hooks/useDiagnosisQuery'
import { toCommonQueryParams, toStoreHistoryParams, toV2QueryParams } from './params'
import { groupMarkers } from '../components/map/groupMarkers'
import { storeFranchise } from '../utils/storeDisplay'
import { brandFilterNotice } from '../utils/brands'
import { MESSAGES } from '../constants/messages'
import type { ChainStore } from '../types/brands'
import { adaptChainHistory, adaptChainNearby } from './storeAdapters'
import type { ApiMeta, V2QueryParams } from '../types/api'
import type { RiskInterpretation } from '../types/risk'
import type { ApiResult } from './client'
import { interpretationMatches } from './interpretationContext'
import { hasRiskBaseline } from './interpretationContext'
import { queryKeys } from './queryKeys'

const query = parseDiagnosisQuery(
  new URLSearchParams('category=cafe&lat=37.56&lng=126.97&bk=test'),
  'v2',
)
const coords = { lat: 37.56, lng: 126.97 }
const params: V2QueryParams = {
  lat: 37.56,
  lng: 126.97,
  category: 'cafe',
  radius: 500,
  brand_scope: 'chain',
  brand_unknown: 'exclude',
  brand_evidence: 'include_estimates',
  brand_time_basis: 'observed_record',
  operation_type: 'any',
}
const filters = {
  sub_category: [],
  area: 'all',
  include_unknown_area: true,
  brand_scope: 'chain',
  brand_unknown: 'exclude',
  brand_evidence: 'include_estimates',
  brand_time_basis: 'observed_record',
  operation_type: 'any',
} as const
const baseline: ApiMeta = {
  as_of: '2026-11-08',
  data_updated_at: '2026-11-08',
  data_version: { rule_version: 'test' },
  brand_filters: { ...filters, sub_category: [] },
  brand_classification: { status: 'estimate', generation: 'test-generation', source_drift: false },
}

function result(): ApiResult<RiskInterpretation> & { meta: ApiMeta } {
  const { sub_category, ...evidenceFilters } = filters
  return {
    meta: {
      ...structuredClone(baseline),
      prompt_version: 'chain-risk-interpret-v1',
      prompt_sha256: 'a'.repeat(64),
      context_hash: 'b'.repeat(64),
      data_version_hash: 'c'.repeat(64),
    },
    data: {
      body: Array(4).fill('검증 문단').join('\n\n'),
      label: 'AI 해석',
      official_values: [],
      favorable: [],
      unfavorable: [],
      missing_data: [],
      checklist: [],
      model: 'test',
      generated_at: '2026-11-15T00:00:00Z',
      verification: { passed: true, checked_numbers: 0, mismatches: [], regenerated: false },
      paragraphs: Array.from({ length: 4 }, () => ({ text: '검증 문단', indicator_ids: [] })),
      evidence: {
        category: 'cafe',
        sub_category: [...sub_category, 'cafe'],
        radius_m: 500,
        filters: evidenceFilters,
        brand_classification: { status: 'estimate', source_drift: false },
        as_of: '2026-11-08',
        data_updated_at: '2026-11-08',
      },
    },
  }
}

function row(): ChainStore {
  return {
    source: 'rest_cafe',
    license_no: 'test-only',
    name: null,
    category: 'cafe',
    sub_category: 'cafe',
    open_date: null,
    close_date: null,
    operating_months: null,
    operating_period_status: 'no_data',
    operating_period_reason: 'missing_open_date',
    current_status: 'open',
    lat: null,
    lng: null,
    distance_m: null,
    area_m2: null,
    location_match: null,
    brand: {
      status: 'unknown',
      brand_key: null,
      name: null,
      basis: null,
      reason: 'stale_input',
      reference_year: null,
      reference_month: null,
      time_basis: 'observed_record',
      historical_membership: 'not_verified',
    },
    operation: { type: 'unknown', basis: null },
  }
}

describe('v2 profile and URL contract', () => {
  it('defaults safely to v1 and rejects invalid profile values', () => {
    expect(parseAnalysisVersion()).toBe('v1')
    expect(parseAnalysisVersion('')).toBe('v1')
    expect(parseAnalysisVersion('v2')).toBe('v2')
    expect(() => parseAnalysisVersion('v3')).toThrow()
  })
  it('round trips new URL keys without legacy franchise or shared unknown flags', () => {
    const q = {
      ...query,
      brandScope: 'chain' as const,
      brandUnknown: 'exclude' as const,
      brandEvidence: 'include_estimates' as const,
      includeUnknown: false,
    }
    const search = toDiagnosisSearch(q, 'v2')
    expect(search).toContain('areaUnknown=false')
    expect(search).not.toContain('includeUnknown=')
    expect(search).not.toContain('franchise=')
    expect(parseDiagnosisQuery(new URLSearchParams(search), 'v2')).toMatchObject(q)
    expect(parseDiagnosisQuery(new URLSearchParams(search), 'v1').brandUrlNotice).toBe(
      'unsupported_brand',
    )
  })
  it('migrates legacy independent to 전체 (비체인 조건은 화면에서 뺐다), keeping the area flag', () => {
    const q = parseDiagnosisQuery(
      new URLSearchParams('category=cafe&franchise=independent&includeUnknown=false'),
      'v2',
    )
    expect(q).toMatchObject({
      brandScope: 'all',
      brandUnknown: 'include',
      brandEvidence: 'include_estimates',
      includeUnknown: false,
    })
    expect(q.brandUrlNotice).toBeUndefined()
    expect(
      parseDiagnosisQuery(new URLSearchParams('category=cafe&franchise=franchise'), 'v2'),
    ).toMatchObject({ brandScope: 'chain', brandUnknown: 'exclude' })
    expect(
      parseDiagnosisQuery(new URLSearchParams('franchise=all&includeUnknown=false'), 'v2'),
    ).toMatchObject({ brandScope: 'all', brandUnknown: 'include', includeUnknown: false })
  })
  it('new explicit brand conditions take precedence over a legacy bookmark', () => {
    expect(
      parseDiagnosisQuery(
        new URLSearchParams('franchise=independent&brandScope=chain&brandUnknown=include'),
        'v2',
      ),
    ).toMatchObject({
      brandScope: 'chain',
      brandUnknown: 'exclude',
      brandEvidence: 'include_estimates',
      brandUrlNotice: 'mixed_legacy',
    })
  })
  it('does not apply an old shared unknown flag to a native v2 link', () => {
    expect(
      parseDiagnosisQuery(
        new URLSearchParams('analysisVersion=v2&brandScope=all&includeUnknown=false'),
        'v2',
      ),
    ).toMatchObject({
      includeUnknown: true,
      brandUnknown: 'include',
      brandUrlNotice: 'mixed_legacy',
    })
    const legacyArea = parseDiagnosisQuery(new URLSearchParams('includeUnknown=false'), 'v2')
    expect(legacyArea).toMatchObject({ includeUnknown: false, brandUnknown: 'include' })
    expect(legacyArea.brandUrlNotice).toBeUndefined()
  })
  it('notifies when invalid brand values are reset', () => {
    expect(
      parseDiagnosisQuery(new URLSearchParams('brandScope=private&brandUnknown=bad'), 'v2'),
    ).toMatchObject({ brandScope: 'all', brandUnknown: 'include', brandUrlNotice: 'invalid_brand' })
  })
  it('does not choose the first of duplicate brand or area flags', () => {
    expect(
      parseDiagnosisQuery(
        new URLSearchParams(
          'brandScope=chain&brandScope=non_chain&areaUnknown=false&areaUnknown=true',
        ),
        'v2',
      ),
    ).toMatchObject({ brandScope: 'all', includeUnknown: true, brandUrlNotice: 'invalid_brand' })
    expect(
      parseDiagnosisQuery(new URLSearchParams('analysisVersion=unsupported'), 'v2').brandUrlNotice,
    ).toBe('invalid_brand')
  })
  for (const brandScope of ['all', 'chain', 'non_chain'] as const)
    for (const brandUnknown of ['include', 'exclude'] as const)
      for (const brandEvidence of ['include_estimates', 'confirmed_only'] as const)
        it(`keeps area independent for ${brandScope}/${brandUnknown}/${brandEvidence}`, () => {
          const p = toV2QueryParams(
            { ...query, brandScope, brandUnknown, brandEvidence, includeUnknown: false },
            coords,
          )
          expect(p).toMatchObject({
            brand_scope: brandScope,
            brand_unknown: brandUnknown,
            brand_evidence: brandEvidence,
            include_unknown_area: false,
            brand_time_basis: 'observed_record',
            operation_type: 'any',
          })
          expect(p).not.toHaveProperty('franchise')
          expect(p).not.toHaveProperty('include_unknown_franchise')
          expect(toStoreHistoryParams(query)).toEqual({ building_key: 'test', category: 'cafe' })
        })
  it('preserves the legacy builder independently', () => {
    expect(toCommonQueryParams({ ...query, franchise: 'franchise' }, coords, 'v1')).toMatchObject({
      franchise: 'franchise',
      include_unknown_franchise: false,
    })
    expect(toCommonQueryParams(query, coords, 'v1')).not.toHaveProperty('brand_scope')
  })
})

describe('v2 record display and nullable values', () => {
  it('preserves null locations/dates and record counts while omitting only map points', () => {
    const s = row()
    const data = adaptChainNearby({
      center: coords,
      radius_m: 500,
      as_of: '2026-11-08',
      count: 1,
      excluded_no_coord: 0,
      markers: [s],
      message: null,
    })
    expect(data.markers[0]).toMatchObject({ lat: null, open_date: null })
    expect(data.count).toBe(1)
    expect(groupMarkers(data.markers)).toHaveLength(0)
    const history = adaptChainHistory({ total: 1, stores: [s], message: null })
    expect(history.stores[0]).toMatchObject({ store_status: 'open', location_match: null })
    expect(history.stores[0]).not.toHaveProperty('franchise')
  })
  it('rejects malformed required status and legacy franchise contamination', () => {
    const s = row()
    Object.assign(s, { current_status: 'broken' })
    expect(() => adaptChainHistory({ total: 1, stores: [s], message: null })).toThrow()
    const legacy = Object.assign(row(), { franchise: 'independent' })
    expect(() => adaptChainHistory({ total: 1, stores: [legacy], message: null })).toThrow()
  })
  it('rejects missing operation and unsupported observed/history claims', () => {
    for (const broken of [
      Object.assign(row(), { operation: undefined }),
      { ...row(), brand: { ...row().brand, historical_membership: 'verified' } },
      { ...row(), brand: { ...row().brand, time_basis: 'historical' } },
    ]) {
      expect(() =>
        adaptChainHistory({ total: 1, stores: [broken as ChainStore], message: null }),
      ).toThrow()
    }
  })
  it('never turns missing, stale or conflicted evidence into independent/estimated', () => {
    const s = row()
    expect(storeFranchise(s)).toMatchObject({
      kind: 'unknown',
      label: MESSAGES.brand.unknownLabel,
      help: MESSAGES.brand.stale,
    })
    s.brand.status = 'conflict'
    expect(storeFranchise(s)).toMatchObject({ kind: 'conflict', label: MESSAGES.brand.conflict })
    s.brand.status = 'estimated'
    s.brand.basis = 'semas_address_corroborated'
    expect(storeFranchise(s)).toMatchObject({ kind: 'estimate', label: MESSAGES.brand.estimate })
    expect(brandFilterNotice({ brandScope: 'non_chain' }, baseline)).toContain(
      MESSAGES.brand.nonChainLimit,
    )
  })
})

describe('AI shared metadata and selection cache', () => {
  it.each(['approval', 'observation_month', 'old_version_with_new_evidence'] as const)(
    'rejects inconsistent population evidence: %s',
    (failure) => {
      const response = result()
      response.meta.prompt_version = 'chain-risk-interpret-v2'
      response.data.evidence!.population_reference = {
        status: 'no_data',
        reason: 'no_observation_in_period',
        analysis_date: response.meta.as_of!,
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
      expect(interpretationMatches(response, params, baseline)).toBe(true)
      const p = response.data.evidence!.population_reference
      if (failure === 'approval') Object.assign(p, { population_total_validated: true })
      if (failure === 'observation_month')
        Object.assign(p, {
          status: 'pending',
          reason: 'ambiguous_source_version',
          observation_date: '2026-10-31',
        })
      if (failure === 'old_version_with_new_evidence')
        response.meta.prompt_version = 'chain-risk-interpret-v1'
      expect(interpretationMatches(response, params, baseline)).toBe(false)
    },
  )
  it('accepts both released prompts while requiring new population evidence for v2', () => {
    const response = result()
    response.meta.prompt_version = 'chain-risk-interpret-v2'
    expect(interpretationMatches(response, params, baseline)).toBe(false)
    response.data.evidence!.population_reference = {
      status: 'no_data',
      reason: 'no_observation_in_period',
      analysis_date: response.meta.as_of!,
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
    expect(interpretationMatches(response, params, baseline)).toBe(true)
    response.data.evidence!.population_reference.analysis_date = '2025-01-01'
    expect(interpretationMatches(response, params, baseline)).toBe(false)
    response.meta.prompt_version = 'chain-risk-interpret-v3'
    expect(interpretationMatches(response, params, baseline)).toBe(false)
    expect(interpretationMatches(result(), params, baseline)).toBe(true)
  })
  it('accepts the real date-only contract and does not equate raw version metadata with an AI hash', () => {
    expect(interpretationMatches(result(), params, baseline)).toBe(true)
    expect(baseline.data_version).not.toEqual(result().meta.data_version_hash)
  })
  it.each(['generation', 'source_drift', 'status'] as const)(
    'rejects changed brand metadata: %s',
    (key) => {
      const response = result()
      Object.assign(response.meta.brand_classification!, {
        [key]: key === 'source_drift' ? true : 'different',
      })
      expect(interpretationMatches(response, params, baseline)).toBe(false)
    },
  )
  it.each(['as_of', 'data_updated_at'] as const)(
    'rejects different or missing %s without converting formats',
    (key) => {
      const response = result()
      response.meta[key] = '2026-11-08T00:00:00Z'
      expect(interpretationMatches(response, params, baseline)).toBe(false)
      delete response.meta[key]
      expect(interpretationMatches(response, params, baseline)).toBe(false)
    },
  )
  it('rejects mismatched filters, category, radius and unverified output', () => {
    const response = result()
    response.meta.brand_filters!.brand_unknown = 'include'
    expect(interpretationMatches(response, params, baseline)).toBe(false)
    const wrong = result()
    wrong.data.evidence!.radius_m = 300
    expect(interpretationMatches(wrong, params, baseline)).toBe(false)
    expect(interpretationMatches(result(), { ...params, category: 'restaurant' }, baseline)).toBe(
      false,
    )
    const unverified = result()
    unverified.data.verification.passed = false
    expect(interpretationMatches(unverified, params, baseline)).toBe(false)
    expect(interpretationMatches(result(), params, null)).toBe(false)
  })
  it('does not use generated_at as data identity', () => {
    const response = result()
    response.data.generated_at = '2027-01-01T00:00:00Z'
    expect(interpretationMatches(response, params, baseline)).toBe(true)
  })
  it('requires the four rendered paragraphs to agree with server paragraph records', () => {
    const response = result()
    response.data.body = '한 문단만 있는 잘못된 응답'
    expect(interpretationMatches(response, params, baseline)).toBe(false)
  })
  it('compares expanded evidence categories against the documented selection semantics', () => {
    const restaurant = { ...params, category: 'restaurant' as const }
    const response = result()
    response.data.evidence!.category = 'restaurant'
    response.data.evidence!.sub_category = ['korean', 'chinese', 'japanese', 'western']
    expect(interpretationMatches(response, restaurant, baseline)).toBe(true)
    response.data.evidence!.sub_category = ['korean']
    expect(interpretationMatches(response, restaurant, baseline)).toBe(false)
  })
  it('accepts pending with an explicit null generation, never an absent baseline', () => {
    const pending = structuredClone(baseline)
    pending.brand_classification = { status: 'pending', generation: null, source_drift: false }
    const response = result()
    response.meta.brand_classification = pending.brand_classification
    response.data.evidence!.brand_classification = { status: 'pending', source_drift: false }
    expect(hasRiskBaseline(params, pending)).toBe(true)
    expect(interpretationMatches(response, params, pending)).toBe(true)
    expect(hasRiskBaseline(params, {})).toBe(false)
  })
  it('requires current evidence status and valid server hash metadata', () => {
    const response = result()
    response.meta.context_hash = 'invalid'
    expect(interpretationMatches(response, params, baseline)).toBe(false)
    const drift = result()
    drift.data.evidence!.brand_classification = { status: 'estimate', source_drift: true }
    expect(interpretationMatches(drift, params, baseline)).toBe(false)
  })
  it('separates brand conditions in every profile cache key', () => {
    const a = queryKeys.riskInterpretation(params, undefined, 'same address', baseline)
    const changed = queryKeys.riskInterpretation(
      { ...params, brand_unknown: 'include' },
      undefined,
      'same address',
      baseline,
    )
    expect(changed).not.toEqual(a)
  })
})
