import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { afterEach, expect, it, vi } from 'vitest'
import { populationFixture } from './mocks/populationFixture'
import { populationOptions } from './population'

afterEach(() => {
  vi.unstubAllGlobals()
})

it('real QueryObserver cancels the old spatial query and never exposes it under the new key', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: 0 } } })
  const signals: AbortSignal[] = []
  const fetch = vi.fn<typeof globalThis.fetch>((input, init) => {
    signals.push(init!.signal as AbortSignal)
    const url = new URL(String(input))
    if (url.searchParams.get('radius') === '500') {
      return new Promise((_resolve, reject) =>
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('cancelled', 'AbortError')),
        ),
      )
    }
    return Promise.resolve(
      new Response(
        JSON.stringify({
          ...populationFixture,
          data: {
            ...populationFixture.data,
            scope: { ...populationFixture.data.scope, radius_m: 300 },
          },
        }),
      ),
    )
  })
  vi.stubGlobal('fetch', fetch)
  const params = { lat: 37.5, lng: 127, category: 'cafe' as const }
  const observer = new QueryObserver(client, populationOptions(params))
  const unsubscribe = observer.subscribe(() => {})
  await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
  observer.setOptions(populationOptions({ ...params, radius: 300 }))
  await vi.waitFor(() => expect(observer.getCurrentResult().data?.data.scope.radius_m).toBe(300))
  expect(signals[0].aborted).toBe(true)
  expect(observer.getCurrentResult().data?.data.scope.radius_m).not.toBe(500)
  observer.setOptions(populationOptions({ ...params, radius: 300, ...{ brand_scope: 'chain' } }))
  expect(fetch).toHaveBeenCalledTimes(2)
  unsubscribe()
  client.clear()
})

it('a disabled population query stays idle, not actively loading', () => {
  const client = new QueryClient()
  const observer = new QueryObserver(client, populationOptions(null))
  const unsubscribe = observer.subscribe(() => {})
  expect(observer.getCurrentResult().isPending).toBe(true)
  expect(observer.getCurrentResult().isFetching).toBe(false)
  expect(observer.getCurrentResult().isLoading).toBe(false)
  unsubscribe()
  client.clear()
})
