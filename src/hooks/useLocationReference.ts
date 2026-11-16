import { useQuery } from '@tanstack/react-query'
import { locationOptions } from '../api/locationReference'
import type { LocationParams } from '../types/locationReference'

export function useLocationReference(params: LocationParams | null) {
  return useQuery(locationOptions(params))
}
