import { queryOptions, skipToken } from '@tanstack/react-query'
import { apiGet, ApiRequestError } from './client'
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
    // The Free backend has one DB connection. A short checkout failure can recover
    // after the initial page's other queries finish; never retry invalid/cancelled inputs.
    retry: (failureCount, error) =>
      failureCount < 1 &&
      error instanceof ApiRequestError &&
      (error.status === 500 || error.status === 503),
    retryDelay: 1000,
  })
}
