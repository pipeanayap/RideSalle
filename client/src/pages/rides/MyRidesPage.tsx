import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, MapPin, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyRides, useCancelRide, useCompleteRide } from '@/hooks/useRides';
import type { Ride } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programado',
  in_progress: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  scheduled: 'default',
  in_progress: 'secondary',
  completed: 'outline',
  cancelled: 'destructive',
};

function RideItem({ ride }: { ride: Ride }): ReactElement {
  const cancelRide = useCancelRide();
  const completeRide = useCompleteRide();

  async function handleCancel() {
    try {
      await cancelRide.mutateAsync(ride._id);
      toast.success('Viaje cancelado');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al cancelar');
    }
  }

  async function handleComplete() {
    try {
      await completeRide.mutateAsync(ride._id);
      toast.success('Viaje marcado como completado');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al completar');
    }
  }

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
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(ride.departureAt), "d MMM 'a las' HH:mm", { locale: es })}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {ride.seatsAvailable}/{ride.totalSeats}
            </span>
          </div>
        </Link>
        <Badge variant={STATUS_VARIANTS[ride.status]}>{STATUS_LABELS[ride.status]}</Badge>
      </div>

      {ride.status === 'scheduled' && (
        <div className="flex gap-2 border-t pt-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => void handleComplete()}
            disabled={completeRide.isPending}
          >
            Completar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={() => void handleCancel()}
            disabled={cancelRide.isPending}
          >
            Cancelar
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export default function MyRidesPage(): ReactElement {
  const { data: rides, isLoading } = useMyRides();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis viajes</h1>
          <p className="text-sm text-muted-foreground">Como conductor</p>
        </div>
        <Button size="sm" asChild>
          <Link to="/rides/publish">
            <Plus className="mr-1 h-4 w-4" /> Publicar
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      ) : rides?.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-muted-foreground">No has publicado ningún viaje aún.</p>
          <Button asChild>
            <Link to="/rides/publish">Publicar mi primer viaje</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rides?.map((ride) => <RideItem key={ride._id} ride={ride} />)}
        </div>
      )}
    </div>
  );
}
