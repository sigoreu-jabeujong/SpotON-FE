import type { PopulationParams, PopulationReference } from '../types/population'
import { queryOptions, skipToken } from '@tanstack/react-query'
import { apiGet } from './client'

/** Project only population inputs. Store/brand filters never reach this endpoint. */
export function populationParams(params: PopulationParams): PopulationParams {
  return {
    lat: params.lat,
    lng: params.lng,
    radius: params.radius ?? 500,
    category: params.category,
    sub_category: [...(params.sub_category ?? [])].sort(),
    ...(params.as_of ? { as_of: params.as_of } : {}),
  }
}

export function populationKey(params: PopulationParams | null) {
  return ['population-reference', params ? populationParams(params) : null] as const
}

export function getPopulationReference(params: PopulationParams, signal?: AbortSignal) {
  // Deliberately fixed even in a v1 analysis profile; this endpoint accepts neither profile's filters.
  return apiGet<PopulationReference>('/v2/population-reference', populationParams(params), {
    signal,
  })
}

export function populationOptions(params: PopulationParams | null) {
  return queryOptions({
    queryKey: populationKey(params),
    queryFn: params ? ({ signal }) => getPopulationReference(params, signal) : skipToken,
    staleTime: 0,
    retry: false,
  })
}
