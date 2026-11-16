import { afterEach, expect, it, vi } from 'vitest'
import { getLocationHistory } from './locationHistory'
const params = {
  building_key: '마포구-서교동-490-0',
  address: '서울 마포구 양화로 45',
  lat: 37.55,
  lng: 126.92,
  floor_unit: '2층',
  scope: 'floor' as const,
  identity_requirement: 'address_scope' as const,
  category: 'cafe' as const,
}
const row = {
  history_scope: 'floor',
  match_evidence: 'both',
  source: 'rest_cafe',
  license_no: 'synthetic',
  name: 'synthetic',
  category: 'cafe',
  sub_category: 'cafe',
  current_status: 'closed',
  open_date: '2020-01-01',
  close_date: '2022-01-01',
  operating_months: 24,
  operating_period_status: 'fact',
  operating_period_reason: null,
  brand: {
    status: 'unknown',
    reason: 'no_evidence',
    time_basis: 'observed_record',
    historical_membership: 'not_verified',
  },
  operation: { type: 'unknown', basis: null },
}
const response = () => ({
  total: 1,
  stores: [row],
  selection: {
    building_key: params.building_key,
    road_key: '마포구|양화로|N|45|0',
    scope: 'floor',
    identity_requirement: 'address_scope',
    floor: '2층',
    unit: null,
  },
  result_status: 'matched',
  location_coverage: 'partial',
  open_count: 0,
  closed_count: 1,
  other_count: 0,
  detail_unresolved_count: 1,
  address_conflict_count: 0,
  address_unresolved_count: 0,
  candidate_count: 2,
  excluded_counts: { floor: 0, unit: 0 },
  dated_closure_count: 1,
  undated_closure_count: 0,
  current_vacancy: 'not_verified',
})
function serve(data: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string) =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: url.includes('/address-context')
              ? {
                  context: 'signed',
                  building_key: params.building_key,
                  road_key: '마포구|양화로|N|45|0',
                  rule_version: 'road-jibun-v1',
                }
              : data,
            meta: {},
            error: null,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    ),
  )
}
afterEach(() => vi.unstubAllGlobals())
it('accepts active records while still rejecting a mismatched floor', async () => {
  serve({
    ...response(),
    open_count: 1,
    closed_count: 0,
    dated_closure_count: 0,
    stores: [{ ...row, current_status: 'open', close_date: null }],
  })
  const result = await getLocationHistory(params)
  expect(result.data.stores[0].store_status).toBe('open')
  serve({ ...response(), selection: { ...response().selection, floor: '3층' } })
  await expect(getLocationHistory(params)).rejects.toThrow()
})
it('preserves partial coverage and closed records', async () => {
  serve(response())
  const result = await getLocationHistory(params)
  expect(result.data.location?.unresolved_count).toBe(1)
  expect(result.data.stores[0].store_status).toBe('closed')
})

it('queries both verified address forms without requiring a floor', async () => {
  serve({
    ...response(),
    stores: [{ ...row, history_scope: 'address' }],
    selection: { ...response().selection, scope: 'address', floor: null },
  })
  const result = await getLocationHistory({ ...params, floor_unit: undefined, scope: 'address' })
  expect(result.data.total).toBe(1)
  expect(fetch).toHaveBeenCalledTimes(2)
  const calls = vi.mocked(fetch).mock.calls
  expect(calls[0][0]).toContain('/v3/address-context')
  expect(calls[1][0]).toContain('/v3/stores/location-history?context=signed')
  expect(calls[1][0]).not.toContain('floor_unit')
})

it('rejects incoherent union counts and a different selected lot', async () => {
  serve({ ...response(), candidate_count: 99 })
  await expect(getLocationHistory(params)).rejects.toThrow('invalid_location_history')
  serve({ ...response(), selection: { ...response().selection, building_key: 'different' } })
  await expect(getLocationHistory(params)).rejects.toThrow('invalid_location_history')
})
