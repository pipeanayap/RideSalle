import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';

export function useMyBookings() {
  return useQuery({
    queryKey: ['bookings', 'my'],
    queryFn: bookingsApi.myBookings,
  });
}

export function usePendingDriverBookings() {
  return useQuery({
    queryKey: ['bookings', 'pending-driver'],
    queryFn: bookingsApi.pendingAsDriver,
    refetchInterval: 15_000,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rideId, seats, message }: { rideId: string; seats?: number; message?: string }) =>
      bookingsApi.create(rideId, seats, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['rides'] });
    },
  });
}

export function useAcceptBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookingsApi.accept,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useRejectBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookingsApi.reject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['rides'] });
    },
  });
}
