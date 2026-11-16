import type { LocationReference } from '../../types/locationReference'
import type { MockHandler } from './index'
import fixtures from './restaurantMarketFixtures.json'

/** Synthetic, backend-validated examples only. Never included in the production profile. */
const samples = fixtures as unknown as Record<string, LocationReference>
export function locationReferenceFixture(
  selection: string[] = [],
  state: 'ready' | 'partial' | 'no_data' | 'cafe' = 'ready',
): LocationReference {
  const key =
    state === 'ready'
      ? [...(selection.length ? selection : ['korean', 'chinese', 'japanese', 'western'])]
          .sort()
          .join(',')
      : state
  if (!samples[key]) throw new Error('Unsupported synthetic industry selection')
  return structuredClone(samples[key])
}

export const locationReferenceMock: MockHandler = (query) => {
  const category = query.get('category')
  const selected = query.get('sub_category')?.split(',') ?? []
  const allowed = category === 'cafe' ? ['cafe'] : ['korean', 'chinese', 'japanese', 'western']
  if (
    !['cafe', 'restaurant'].includes(category ?? '') ||
    new Set(selected).size !== selected.length ||
    selected.some((s) => !allowed.includes(s))
  ) {
    return {
      status: 422,
      body: {
        data: null,
        meta: {},
        error: { code: 'INVALID_PARAM', message: '조회 조건을 확인해 주세요.' },
      },
    }
  }
  const data = locationReferenceFixture(
    category === 'cafe' ? [] : selected,
    category === 'cafe' ? 'cafe' : 'ready',
  )
  return { status: 200, body: { data, meta: { is_demo: true }, error: null } }
}
