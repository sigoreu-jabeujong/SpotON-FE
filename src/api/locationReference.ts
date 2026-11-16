import { queryOptions, skipToken } from '@tanstack/react-query'
import { apiGet } from './client'
import { populationParams } from './population'
import type { LocationParams, LocationReference } from '../types/locationReference'

export function locationParams(params: LocationParams): LocationParams {
  return { ...populationParams(params), time_mode: params.time_mode ?? 'latest_reference' }
}

export function getLocationReference(params: LocationParams, signal?: AbortSignal) {
  return apiGet<LocationReference>('/v2/location-reference', locationParams(params), { signal })
}

export function locationOptions(params: LocationParams | null) {
  const input = params ? locationParams(params) : null
  return queryOptions({
    queryKey: ['location-reference', input] as const,
    queryFn: input ? ({ signal }) => getLocationReference(input, signal) : skipToken,
    staleTime: 0,
    retry: false,
  })
}
