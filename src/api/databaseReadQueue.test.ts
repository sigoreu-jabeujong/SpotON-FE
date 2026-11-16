import { describe, expect, it } from 'vitest'
import { createReadQueue, isDatabaseRead } from './databaseReadQueue'

function gate() {
  let release!: () => void
  const promise = new Promise<void>((resolve) => {
    release = resolve
  })
  return { promise, release }
}

describe('single connection DB read scheduling', () => {
  it('runs only one read at a time and releases after failure', async () => {
    const run = createReadQueue()
    const hold = gate()
    const calls: number[] = []
    const first = run(async () => {
      calls.push(1)
      await hold.promise
      throw new Error('failed')
    })
    const failure = expect(first).rejects.toThrow('failed')
    const second = run(async () => {
      calls.push(2)
      return 'ok'
    })
    await Promise.resolve()
    await Promise.resolve()
    expect(calls).toEqual([1])
    hold.release()
    await failure
    expect(await second).toBe('ok')
    expect(calls).toEqual([1, 2])
  })

  it('cancels a queued read immediately without fetching or blocking its successor', async () => {
    const run = createReadQueue()
    const hold = gate()
    const first = run(() => hold.promise)
    const controller = new AbortController()
    let fetched = false
    const cancelled = run(async () => {
      fetched = true
    }, controller.signal)
    const failure = expect(cancelled).rejects.toMatchObject({ name: 'AbortError' })
    const third = run(async () => 3)
    controller.abort()
    await failure
    expect(fetched).toBe(false)
    hold.release()
    await first
    expect(await third).toBe(3)
  })

  it('queues DB endpoints but leaves address lookup, health and AI outside the read queue', () => {
    for (const path of [
      '/meta/data-range',
      '/v2/risk?lat=1',
      '/v2/location-reference',
      '/v2/market/activity',
      '/v3/stores/location-history',
    ]) {
      expect(isDatabaseRead(path)).toBe(true)
    }
    for (const path of [
      '/health',
      '/ready',
      '/geocode',
      '/address-detail',
      '/v3/address-context',
      '/v2/interpret',
    ]) {
      expect(isDatabaseRead(path)).toBe(false)
    }
  })
})
