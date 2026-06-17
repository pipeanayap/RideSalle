import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyBookings, useCancelBooking, useAcceptBooking, useRejectBooking, usePendingDriverBookings } from '@/hooks/useBookings';
import type { Booking } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
};
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  accepted: 'default',
  rejected: 'destructive',
  cancelled: 'outline',
};

function PassengerBookingItem({ booking }: { booking: Booking }): ReactElement {
  const cancelBooking = useCancelBooking();

  async function handleCancel() {
    try {
      await cancelBooking.mutateAsync(booking._id);
      toast.success('Reserva cancelada');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al cancelar');
    }
  }

  const ride = booking.ride;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <Link to={`/rides/${ride._id}`} className="space-y-1 hover:opacity-80">
          <div className="flex items-center gap-1.5 font-medium text-sm">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {ride.origin} → {ride.destination}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(ride.departureAt), "d MMM 'a las' HH:mm", { locale: es })}
          </div>
        </Link>
        <Badge variant={STATUS_VARIANTS[booking.status]}>{STATUS_LABELS[booking.status]}</Badge>
      </div>

      {(booking.status === 'pending' || booking.status === 'accepted') && (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => void handleCancel()}
          disabled={cancelBooking.isPending}
        >
          Cancelar reserva
        </Button>
      )}
    </motion.div>
  );
}

function DriverBookingItem({ booking }: { booking: Booking }): ReactElement {
  const accept = useAcceptBooking();
  const reject = useRejectBooking();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="font-medium text-sm">
            {booking.passenger.firstName} {booking.passenger.lastName}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {booking.ride.origin} → {booking.ride.destination}
          </div>
          {booking.message && (
            <p className="text-xs italic text-muted-foreground">"{booking.message}"</p>
          )}
        </div>
        <Badge variant="secondary">Pendiente</Badge>
      </div>

      <div className="flex gap-2 border-t pt-3">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => void accept.mutateAsync(booking._id).then(() => toast.success('Reserva aceptada'))}
          disabled={accept.isPending}
        >
          Aceptar
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="flex-1"
          onClick={() => void reject.mutateAsync(booking._id).then(() => toast.success('Reserva rechazada'))}
          disabled={reject.isPending}
        >
          Rechazar
        </Button>
      </div>
    </motion.div>
  );
}

export default function MyBookingsPage(): ReactElement {
  const { data: myBookings, isLoading: loadingMine } = useMyBookings();
  const { data: pendingBookings, isLoading: loadingPending } = usePendingDriverBookings();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Mis reservas</h1>
          <p className="text-sm text-muted-foreground">Como pasajero</p>
        </div>

        {loadingMine ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        ) : myBookings?.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No tienes reservas. <Link to="/rides" className="text-primary hover:underline">Busca un viaje</Link></p>
          </div>
        ) : (
          <div className="space-y-3">
            {myBookings?.map((b) => <PassengerBookingItem key={b._id} booking={b} />)}
          </div>
        )}
      </section>

      {(pendingBookings?.length ?? 0) > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Solicitudes recibidas</h2>
            <p className="text-sm text-muted-foreground">Como conductor</p>
          </div>
          {loadingPending ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="space-y-3">
              {pendingBookings?.map((b) => <DriverBookingItem key={b._id} booking={b} />)}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
