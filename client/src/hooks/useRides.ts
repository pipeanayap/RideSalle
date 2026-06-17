import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ridesApi, type SearchRidesParams, type CreateRideData } from '../api/rides';

export function useSearchRides(params: SearchRidesParams) {
  return useQuery({
    queryKey: ['rides', params],
    queryFn: () => ridesApi.search(params),
  });
}

export function useRide(id: string) {
  return useQuery({
    queryKey: ['rides', id],
    queryFn: () => ridesApi.getById(id),
    enabled: !!id,
  });
}

export function useMyRides() {
  return useQuery({
    queryKey: ['rides', 'my'],
    queryFn: ridesApi.myRides,
  });
}

export function useCreateRide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRideData) => ridesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rides'] }),
  });
}

export function useCancelRide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ridesApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rides'] }),
  });
}

export function useCompleteRide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ridesApi.complete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rides'] }),
  });
}
