import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, MapPin } from 'lucide-react';
import { adminApi } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Ride } from '@/types';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  scheduled: 'default',
  in_progress: 'secondary',
  completed: 'outline',
  cancelled: 'destructive',
};
const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programado',
  in_progress: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

function RideRow({ ride }: { ride: Ride }): ReactElement {
  const qc = useQueryClient();

  const deleteRide = useMutation({
    mutationFn: () => adminApi.deleteRide(ride._id),
    onSuccess: () => {
      toast.success('Viaje eliminado');
      void qc.invalidateQueries({ queryKey: ['admin', 'rides'] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 rounded-lg border bg-card p-3"
    >
      <div className="min-w-0 flex-1">
        <Link to={`/rides/${ride._id}`} className="text-sm font-medium hover:underline flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate">{ride.origin} → {ride.destination}</span>
        </Link>
        <p className="text-xs text-muted-foreground">
          {format(new Date(ride.departureAt), "d MMM yyyy 'a las' HH:mm", { locale: es })}
        </p>
      </div>
      <Badge variant={STATUS_VARIANTS[ride.status]} className="shrink-0">
        {STATUS_LABELS[ride.status]}
      </Badge>
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0 text-destructive hover:text-destructive"
        onClick={() => void deleteRide.mutateAsync()}
        disabled={deleteRide.isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

export default function AdminRidesPage(): ReactElement {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'rides', page],
    queryFn: () => adminApi.listRides(page, 20),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Viajes</h1>
        <p className="text-sm text-muted-foreground">Todos los viajes publicados</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-3 space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data?.items.map((r) => <RideRow key={r._id} ride={r} />)}
          </div>
          {(data?.totalPages ?? 1) > 1 && (
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {data?.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= (data?.totalPages ?? 1)} onClick={() => setPage((p) => p + 1)}>
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
