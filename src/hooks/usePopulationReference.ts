import { useQuery } from '@tanstack/react-query'
import { populationOptions } from '../api/population'
import type { PopulationParams } from '../types/population'

export function usePopulationReference(params: PopulationParams | null) {
  return useQuery(populationOptions(params))
}
