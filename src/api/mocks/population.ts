import type { MockHandler } from './index'
import { populationFixture } from './populationFixture'

/** Preview-only synthetic data; the production build removes this module. */
export const populationMock: MockHandler = (query) => {
  const body = structuredClone(populationFixture)
  const data = body.data
  const category = query.get('category')
  const radius = Number(query.get('radius') ?? 500)
  const month = query.get('as_of')
  if (!['cafe', 'restaurant'].includes(category ?? '') || ![300, 500, 1000].includes(radius)) {
    return {
      status: 422,
      body: {
        data: null,
        meta: {},
        error: { code: 'INVALID_PARAM', message: '조회 조건을 확인해 주세요.' },
      },
    }
  }
  const scope = {
    ...data.scope,
    radius_m: radius as 300 | 500 | 1000,
    category: category as 'cafe' | 'restaurant',
    sub_category: (query.get('sub_category') ?? '').split(',').filter(Boolean).sort(),
    as_of: month,
  }
  if (month && month !== '2026-11') {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month > '2026-11') {
      return {
        status: 422,
        body: {
          data: null,
          meta: {},
          error: { code: 'AS_OF_OUT_OF_RANGE', message: '조회 가능한 기준월을 확인해 주세요.' },
        },
      }
    }
    const [year, m] = month.split('-').map(Number)
    return {
      status: 200,
      body: {
        data: {
          ...data,
          scope,
          status: 'no_data',
          reason: 'no_observation_in_period',
          analysis_date: new Date(Date.UTC(year, m, 0)).toISOString().slice(0, 10),
          observation_date: null,
          sources: [],
        },
        meta: {
          ...body.meta,
          observation_version_id: null,
          grid_version_id: null,
          input_sha256: null,
          content_sha256: null,
          grid_input_sha256: null,
          grid_content_sha256: null,
          public_subset_calculation_performed: { local: false, long: false, short: false },
        },
        error: null,
      },
    }
  }
  return { status: 200, body: { ...body, data: { ...data, scope } } }
}
