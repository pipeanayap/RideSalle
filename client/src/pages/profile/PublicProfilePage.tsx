import type { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Car, Users, BookOpen } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { usersApi } from '@/api/users';

export default function PublicProfilePage(): ReactElement {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.getPublicProfile(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!data) return <p className="text-center py-16 text-muted-foreground">Usuario no encontrado.</p>;

  const { user, ratings } = data;
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  return (
    <motion.div
      className="space-y-6 pb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.photoUrl} />
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-xl font-bold">{user.firstName} {user.lastName}</h1>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {user.ratingAverage > 0
              ? `${user.ratingAverage.toFixed(1)} (${user.ratingCount} reseñas)`
              : 'Sin calificaciones'}
          </div>
          <Badge variant="secondary">{user.university}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border bg-card p-3">
          <Car className="mx-auto mb-1 h-4 w-4 text-primary" />
          <p className="text-lg font-bold">{user.ridesPublished}</p>
          <p className="text-xs text-muted-foreground">Viajes publicados</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <BookOpen className="mx-auto mb-1 h-4 w-4 text-primary" />
          <p className="text-lg font-bold">{user.ridesCompleted}</p>
          <p className="text-xs text-muted-foreground">Viajes realizados</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <Users className="mx-auto mb-1 h-4 w-4 text-primary" />
          <p className="text-lg font-bold">{user.passengersTransported}</p>
          <p className="text-xs text-muted-foreground">Pasajeros</p>
        </div>
      </div>

      {user.description && (
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">{user.description}</p>
        </div>
      )}

      {user.vehicle && (
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="font-medium flex items-center gap-2">
            <Car className="h-4 w-4 text-primary" /> Vehículo
          </h3>
          <p className="text-sm text-muted-foreground">
            {user.vehicle.brand} {user.vehicle.model} {user.vehicle.year} · {user.vehicle.color} · {user.vehicle.seats} asientos
          </p>
        </div>
      )}

      {ratings.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Calificaciones ({ratings.length})</h2>
          <Separator />
          <div className="space-y-3">
            {ratings.map((r) => (
              <div key={r._id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={r.author.photoUrl} />
                    <AvatarFallback className="text-xs">
                      {`${r.author.firstName[0] ?? ''}${r.author.lastName[0] ?? ''}`.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{r.author.firstName} {r.author.lastName}</span>
                  <div className="ml-auto flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.score ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground pl-9">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
