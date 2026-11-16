import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

async function setup() {
  vi.stubEnv('VITE_USE_MOCK', 'false')
  vi.stubEnv('VITE_API_BASE_URL', 'http://test.invalid')
  const fetch = vi.fn<typeof globalThis.fetch>(
    async () => new Response(JSON.stringify({ data: {}, meta: {}, error: null })),
  )
  vi.stubGlobal('fetch', fetch)
  return { api: await import('./locationReference'), fetch }
}

describe('location reference transport', () => {
  it('projects only seven inputs, canonicalizes keys and separates period modes', async () => {
    const { api, fetch } = await setup()
    const input = {
      lat: 37.5,
      lng: 127,
      category: 'restaurant' as const,
      sub_category: ['western', 'korean'] as ('western' | 'korean')[],
      as_of: '2023-11',
      ...{ brand_scope: 'chain', area: 'lt33', franchise: 'all' },
    }
    await api.getLocationReference(input)
    const url = new URL(String(fetch.mock.calls[0][0]))
    expect(url.pathname).toBe('/api/v2/location-reference')
    const names: string[] = []
    url.searchParams.forEach((_value, name) => names.push(name))
    expect(names.sort()).toEqual([
      'as_of',
      'category',
      'lat',
      'lng',
      'radius',
      'sub_category',
      'time_mode',
    ])
    expect(url.searchParams.get('time_mode')).toBe('latest_reference')
    expect(api.locationOptions(input).queryKey).toEqual(
      api.locationOptions({ ...input, sub_category: ['korean', 'western'], radius: 500 }).queryKey,
    )
    expect(api.locationOptions(input).queryKey).not.toEqual(
      api.locationOptions({ ...input, time_mode: 'analysis_period' }).queryKey,
    )
    expect(api.locationOptions(input).queryKey).not.toEqual(
      api.locationOptions({ ...input, lat: 37.6 }).queryKey,
    )
  })

  it('propagates cancellation and preserves errors instead of inventing fallback numbers', async () => {
    const { api } = await setup()
    vi.stubGlobal(
      'fetch',
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) =>
          init.signal?.addEventListener('abort', () =>
            reject(new DOMException('cancelled', 'AbortError')),
          ),
        ),
    )
    const controller = new AbortController()
    const pending = api.getLocationReference(
      { lat: 37.5, lng: 127, category: 'cafe' },
      controller.signal,
    )
    controller.abort()
    await expect(pending).rejects.toMatchObject({ code: 'TIMEOUT' })
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response(
          JSON.stringify({
            data: null,
            meta: {},
            error: { code: 'NOT_FOUND', message: 'missing' },
          }),
          { status: 404 },
        ),
    )
    await expect(
      api.getLocationReference({ lat: 37.5, lng: 127, category: 'cafe' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
