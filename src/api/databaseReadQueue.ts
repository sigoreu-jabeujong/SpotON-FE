/** The free backend has one DB connection. Queue reads before starting their network timeout. */
export function isDatabaseRead(path: string): boolean {
  return /^\/(?:meta\/|v[123]\/(?:stores\/|market\/|risk(?:[/?]|$)|brands\/|location-reference(?:[/?]|$)|population-reference(?:[/?]|$)))/.test(
    path,
  )
}

export function createReadQueue() {
  let tail: Promise<void> = Promise.resolve()
  return async function run<T>(work: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    const previous = tail
    let release!: () => void
    const turn = new Promise<void>((resolve) => {
      release = resolve
    })
    tail = previous.then(() => turn)
    let cancel!: () => void
    const cancelled = new Promise<never>((_, reject) => {
      cancel = () => reject(new DOMException('Request cancelled', 'AbortError'))
      signal?.addEventListener('abort', cancel, { once: true })
      if (signal?.aborted) cancel()
    })
    try {
      await Promise.race([previous, cancelled])
      signal?.throwIfAborted()
      return await work()
    } finally {
      signal?.removeEventListener('abort', cancel)
      release()
    }
  }
}

const localQueue = createReadQueue()

export async function withDatabaseReadSlot<T>(
  work: () => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  // Share the slot with same-origin report frames and other tabs where supported.
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return await navigator.locks.request('spoton-database-read', { signal }, work)
  }
  return localQueue(work, signal)
}
