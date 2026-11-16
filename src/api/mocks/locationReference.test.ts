import { describe, expect, it } from 'vitest'
import { getMockResponse } from './index'
import { locationReferenceMock } from './locationReference'
import type { LocationReference } from '../../types/locationReference'

describe('synthetic location reference route', () => {
  it('is registered and keeps selected industries in the response', async () => {
    const result = await getMockResponse<LocationReference>(
      '/v2/location-reference?category=restaurant&sub_category=korean,chinese',
    )
    expect(result?.status).toBe(200)
    expect(result?.body.meta?.is_demo).toBe(true)
    expect(result?.body.data?.sales.market_aggregation?.selected_market_codes).toEqual([
      '3110001',
      '3110000',
      '3110002',
    ])
    expect(result?.body.data?.sales.market_aggregation?.requested_industries).toHaveLength(2)
  })
  it('defaults restaurant selection to all four and cafe projection to null', () => {
    const all = locationReferenceMock(new URLSearchParams('category=restaurant'), null)
    expect(
      (all.body.data as LocationReference).sales.market_aggregation?.requested_industries,
    ).toHaveLength(4)
    const cafe = locationReferenceMock(new URLSearchParams('category=cafe'), null)
    expect((cafe.body.data as LocationReference).sales.market_aggregation).toBeNull()
  })
  it('rejects invalid categories, duplicate selections and empty literal selection', () => {
    for (const query of [
      'category=wrong',
      'category=cafe&sub_category=korean',
      'category=restaurant&sub_category=korean,korean',
      'category=restaurant&sub_category=',
    ]) {
      expect(locationReferenceMock(new URLSearchParams(query), null).status).toBe(422)
    }
  })
})
