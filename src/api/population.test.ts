import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

async function setup(mock = false, profile = 'v1') {
  vi.resetModules()
  vi.stubEnv('VITE_USE_MOCK', String(mock))
  vi.stubEnv('VITE_ANALYSIS_API_VERSION', profile)
  vi.stubEnv('VITE_REAL_API_PATHS', '')
  vi.stubEnv('VITE_API_BASE_URL', 'http://test.invalid')
  const fetch = vi.fn<typeof globalThis.fetch>(
    async () => new Response(JSON.stringify({ data: {}, meta: {}, error: null })),
  )
  vi.stubGlobal('fetch', fetch)
  return { api: await import('./population'), fetch }
}

describe('population reference transport', () => {
  it.each(['v1', 'v2'])(
    'uses the fixed v2 endpoint and projects only six inputs (%s)',
    async (profile) => {
      const { api, fetch } = await setup(false, profile)
      await api.getPopulationReference({
        lat: 37.5,
        lng: 127,
        category: 'restaurant',
        radius: 300,
        sub_category: ['western', 'korean'],
        as_of: '2026-11',
        ...{ brand_scope: 'chain', area: 'lt33', franchise: 'all', include: 'day_night_ratio' },
      })
      const url = new URL(String(fetch.mock.calls[0][0]))
      expect(url.pathname).toBe('/api/v2/population-reference')
      const names: string[] = []
      url.searchParams.forEach((_value, name) => names.push(name))
      expect(names.sort()).toEqual(['as_of', 'category', 'lat', 'lng', 'radius', 'sub_category'])
      expect(url.searchParams.get('sub_category')).toBe('korean,western')
    },
  )

  it('canonical keys ignore irrelevant filters and input ordering, but separate actual spatial/date queries', async () => {
    const { api } = await setup()
    const params = { lat: 37.5, lng: 127, category: 'restaurant' as const }
    expect(api.populationKey({ ...params, sub_category: ['western', 'korean'] })).toEqual(
      api.populationKey({
        ...params,
        radius: 500,
        sub_category: ['korean', 'western'],
        ...{ brand_scope: 'chain', area: 'lt33' },
      }),
    )
    expect(api.populationKey(params)).not.toEqual(api.populationKey({ ...params, radius: 300 }))
    expect(api.populationKey(params)).not.toEqual(
      api.populationKey({ ...params, as_of: '2026-10' }),
    )
    expect(api.populationKey(params)).not.toEqual(api.populationKey({ ...params, lat: 37.6 }))
  })

  it('omits empty subcategories and month instead of sending empty tokens', async () => {
    const { api, fetch } = await setup()
    await api.getPopulationReference({ lat: 37.5, lng: 127, category: 'cafe', sub_category: [] })
    const url = new URL(String(fetch.mock.calls[0][0]))
    expect(url.searchParams.has('sub_category')).toBe(false)
    expect(url.searchParams.has('as_of')).toBe(false)
  })

  it('supports the new mock route without sending a network request', async () => {
    const { api, fetch } = await setup(true)
    const result = await api.getPopulationReference({ lat: 37.5, lng: 127, category: 'cafe' })
    expect(result.meta?.is_demo).toBe(true)
    expect(result.data.sources[0].status).toBe('partial')
    expect(result.data.sources[1].reason).toBe('no_source_rows')
    fetch.mockClear()
    const old = await api.getPopulationReference({
      lat: 37.5,
      lng: 127,
      category: 'cafe',
      as_of: '2026-10',
    })
    expect(old.data.reason).toBe('no_observation_in_period')
    expect(old.data.observation_date).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('propagates query cancellation to fetch', async () => {
    const { api } = await setup()
    const fetch = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new DOMException('cancelled', 'AbortError')),
          )
        }),
    )
    vi.stubGlobal('fetch', fetch)
    const controller = new AbortController()
    const pending = api.getPopulationReference(
      { lat: 37.5, lng: 127, category: 'cafe' },
      controller.signal,
    )
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce())
    controller.abort()
    await expect(pending).rejects.toMatchObject({ code: 'TIMEOUT' })
    expect(fetch.mock.calls[0][1].signal?.aborted).toBe(true)
  })
})
