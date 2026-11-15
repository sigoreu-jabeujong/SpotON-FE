import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.resetModules()
})

async function profile(version: 'v1' | 'v2', mock = false, realPaths = '') {
  vi.resetModules()
  vi.stubEnv('VITE_ANALYSIS_API_VERSION', version)
  vi.stubEnv('VITE_USE_MOCK', mock ? 'true' : 'false')
  vi.stubEnv('VITE_REAL_API_PATHS', realPaths)
  vi.stubEnv('VITE_API_BASE_URL', 'http://test.invalid')
  const fetch = vi.fn<typeof globalThis.fetch>(
    async () =>
      new Response(JSON.stringify({ data: { indicators: [] }, meta: {}, error: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  )
  vi.stubGlobal('fetch', fetch)
  return {
    fetch,
    risk: await import('./risk'),
    params: await import('./params'),
    router: await import('../hooks/useDiagnosisQuery'),
    stores: await import('./stores'),
    keys: await import('./queryKeys'),
  }
}

describe('analysis profile transport boundaries', () => {
  it('sends matching v2 Risk and AI requests, without legacy filters', async () => {
    const { fetch, risk, params, router } = await profile('v2')
    const q = router.parseDiagnosisQuery(
      new URLSearchParams('category=cafe&brandScope=chain&brandUnknown=exclude&areaUnknown=false'),
    )
    const p = params.toCommonQueryParams(q, { lat: 37.5, lng: 127 })!
    await risk.getRisk(p)
    await risk.postRiskInterpret(params.toRiskInterpretRequest(p, undefined))
    expect(String(fetch.mock.calls[0][0])).toContain('/api/v2/risk?')
    expect(String(fetch.mock.calls[1][0])).toBe('http://test.invalid/api/v2/risk/interpret')
    const init = fetch.mock.calls[1][1] as RequestInit
    expect(JSON.parse(String(init.body))).toEqual({ query: p })
    expect(p).toMatchObject({
      brand_scope: 'chain',
      brand_unknown: 'exclude',
      include_unknown_area: false,
    })
    expect(p).not.toHaveProperty('franchise')
  })
  it('rejects legacy contamination before any v2 network call', async () => {
    const { fetch, risk } = await profile('v2')
    expect(() =>
      risk.getRisk({ lat: 37.5, lng: 127, category: 'cafe', franchise: 'independent' }),
    ).toThrow()
    expect(fetch).not.toHaveBeenCalled()
  })
  it('does not let a v1 mock allowlist entry authorize a v2 network request', async () => {
    const { fetch, risk, params, router } = await profile('v2', true, '/risk')
    const p = params.toCommonQueryParams(
      router.parseDiagnosisQuery(new URLSearchParams('category=cafe')),
      { lat: 37.5, lng: 127 },
    )!
    await expect(risk.getRisk(p)).rejects.toMatchObject({ code: 'MOCK_UNAVAILABLE' })
    expect(fetch).not.toHaveBeenCalled()
  })
  it('allows only an exact explicitly listed v2 path in mock mode', async () => {
    const { fetch, risk, params, router } = await profile('v2', true, '/v2/risk')
    const p = params.toCommonQueryParams(
      router.parseDiagnosisQuery(new URLSearchParams('category=cafe')),
      { lat: 37.5, lng: 127 },
    )!
    await risk.getRisk(p)
    expect(fetch).toHaveBeenCalledTimes(1)
    await expect(
      risk.postRiskInterpret(params.toRiskInterpretRequest(p, undefined)),
    ).rejects.toMatchObject({ code: 'MOCK_UNAVAILABLE' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it('preserves v1 default wire behavior', async () => {
    const { fetch, risk, params, router } = await profile('v1')
    const p = params.toCommonQueryParams(
      router.parseDiagnosisQuery(new URLSearchParams('category=cafe&franchise=franchise')),
      { lat: 37.5, lng: 127 },
    )!
    await risk.getRisk(p)
    expect(String(fetch.mock.calls[0][0])).toContain('/api/risk?')
    expect(String(fetch.mock.calls[0][0])).not.toContain('/v2/')
    expect(p).not.toHaveProperty('brand_scope')
  })
  it('separates metadata generations, data versions and drift in actual v2 AI cache keys', async () => {
    const { keys, router, params } = await profile('v2')
    const p = params.toCommonQueryParams(
      router.parseDiagnosisQuery(new URLSearchParams('category=cafe')),
      { lat: 37.5, lng: 127 },
    )!
    const meta = {
      as_of: '2026-11-08',
      data_updated_at: '2026-11-08',
      data_version: { rule_version: 'one' },
      brand_classification: { generation: 'one', status: 'estimate' as const, source_drift: false },
    }
    const key = keys.queryKeys.riskInterpretation(p, undefined, 'same', meta)
    expect(
      keys.queryKeys.riskInterpretation(p, undefined, 'same', {
        ...meta,
        brand_classification: { ...meta.brand_classification, generation: 'two' },
      }),
    ).not.toEqual(key)
    expect(
      keys.queryKeys.riskInterpretation(p, undefined, 'same', {
        ...meta,
        brand_classification: { ...meta.brand_classification, source_drift: true },
      }),
    ).not.toEqual(key)
    expect(
      keys.queryKeys.riskInterpretation(p, undefined, 'same', {
        ...meta,
        data_version: { rule_version: 'two' },
      }),
    ).not.toEqual(key)
  })
})
