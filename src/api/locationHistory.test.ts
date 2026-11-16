import { afterEach, expect, it, vi } from 'vitest'
import { getLocationHistory } from './locationHistory'
const params = {
  building_key: '마포구-서교동-490-0',
  floor_unit: '2층',
  scope: 'floor' as const,
  identity_requirement: 'address_scope' as const,
}
const row = {
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
  selection: { scope: 'floor', identity_requirement: 'address_scope', floor: '2층', unit: null },
  result_status: 'matched',
  location_coverage: 'partial',
  unresolved_closed_count: 1,
  dated_closure_count: 1,
  undated_closure_count: 0,
  current_vacancy: 'not_verified',
})
function serve(data: unknown) {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ data, meta: {}, error: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
  )
}
afterEach(() => vi.unstubAllGlobals())
it('rejects active records and mismatched floor instead of silently displaying them', async () => {
  serve({ ...response(), stores: [{ ...row, current_status: 'open' }] })
  await expect(getLocationHistory(params)).rejects.toThrow()
  serve({ ...response(), selection: { ...response().selection, floor: '3층' } })
  await expect(getLocationHistory(params)).rejects.toThrow()
})
it('preserves partial coverage and only closed records', async () => {
  serve(response())
  const result = await getLocationHistory(params)
  expect(result.data.location?.unresolved_closed_count).toBe(1)
  expect(result.data.stores[0].store_status).toBe('closed')
})
