import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

it('starts the timeout after queue acquisition and lets geocoding bypass a waiting read', async () => {
  vi.useFakeTimers()
  vi.stubEnv('VITE_USE_MOCK', 'false')
  vi.stubGlobal('navigator', {})
  let finish!: (response: Response) => void
  const response = () => new Response(JSON.stringify({ data: { ok: true }, meta: {}, error: null }))
  const fetch = vi.fn<typeof globalThis.fetch>((url) => {
    if (String(url).includes('/v2/risk'))
      return new Promise((resolve) => {
        finish = resolve
      })
    return Promise.resolve(response())
  })
  vi.stubGlobal('fetch', fetch)
  const { apiGet } = await import('./client')
  const first = apiGet('/v2/risk', undefined, { timeoutMs: 1000 })
  await vi.advanceTimersByTimeAsync(0)
  const second = apiGet('/v3/stores/location-history', undefined, { timeoutMs: 10 })
  await apiGet('/geocode')
  await vi.advanceTimersByTimeAsync(100)
  expect(fetch.mock.calls.map(([url]) => String(url).split('/api')[1])).toEqual([
    '/v2/risk',
    '/geocode',
  ])
  finish(response())
  await first
  expect((await second).data).toEqual({ ok: true })
})

it('uses a shared Web Lock for browser frames and preserves the cancellation signal', async () => {
  vi.stubEnv('VITE_USE_MOCK', 'false')
  const request = vi.fn(async (_name, _options, work) => work())
  vi.stubGlobal('navigator', { locks: { request } })
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ data: {}, error: null }))),
  )
  const { apiGet } = await import('./client')
  const signal = new AbortController().signal
  await apiGet('/v3/stores/location-history', undefined, { signal })
  expect(request).toHaveBeenCalledWith('spoton-database-read', { signal }, expect.any(Function))
})
