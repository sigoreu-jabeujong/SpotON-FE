import { useQuery } from '@tanstack/react-query'
import { locationOptions } from '../api/locationReference'
import type { LocationParams } from '../types/locationReference'

export function useLocationReference(params: LocationParams | null, enabled = true) {
  return useQuery({ ...locationOptions(params), enabled })
}
