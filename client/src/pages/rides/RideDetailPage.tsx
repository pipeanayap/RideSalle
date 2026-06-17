import { useState, type ReactElement } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, DollarSign, MessageSquare, Star } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useRide } from '@/hooks/useRides';
import { useCreateBooking } from '@/hooks/useBookings';
import { chatsApi } from '@/api/chats';
import { useAuth } from '@/context/AuthContext';

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

export default function RideDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [message, setMessage] = useState('');

  const { data: ride, isLoading } = useRide(id!);
  const createBooking = useCreateBooking();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p>Viaje no encontrado.</p>
        <Button variant="ghost" asChild className="mt-4">
          <Link to="/rides">← Volver</Link>
        </Button>
      </div>
    );
  }

  const driver = ride.driver;
  const isDriver = user?.id === driver._id || user?.id === (driver as unknown as { id: string }).id;
  const canBook = isAuthenticated && !isDriver && ride.status === 'scheduled' && ride.seatsAvailable > 0;
  const initials = `${driver.firstName[0] ?? ''}${driver.lastName[0] ?? ''}`.toUpperCase();

  async function handleBook() {
    try {
      await createBooking.mutateAsync({ rideId: ride!._id, seats: 1, message });
      toast.success('Reserva solicitada. El conductor la revisará pronto.');
      setShowBookDialog(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al solicitar reserva');
    }
  }

  async function handleChat() {
    try {
      const chat = await chatsApi.joinByRide(ride!._id);
      navigate(`/chats/${chat._id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al abrir chat');
    }
  }

  return (
    <motion.div
      className="space-y-5 pb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/rides">← Volver</Link>
        </Button>
        <Badge variant={STATUS_VARIANTS[ride.status]}>{STATUS_LABELS[ride.status]}</Badge>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h1 className="text-xl font-bold">
          {ride.origin} → {ride.destination}
        </h1>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            {format(new Date(ride.departureAt), "d 'de' MMM 'a las' HH:mm", { locale: es })}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            {ride.seatsAvailable} / {ride.totalSeats} asientos
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4 text-primary" />
            ${ride.pricePerSeat.toLocaleString()} por asiento
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {ride.meetingPoint}
          </div>
        </div>

        {ride.description && (
          <p className="text-sm text-muted-foreground border-t pt-3">{ride.description}</p>
        )}
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Conductor</h2>
        <Link to={`/profile/${driver._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Avatar className="h-12 w-12">
            <AvatarImage src={driver.photoUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{driver.firstName} {driver.lastName}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {driver.ratingAverage > 0 ? driver.ratingAverage.toFixed(1) : 'Sin calificaciones'}
              {driver.ratingCount > 0 && ` (${driver.ratingCount})`}
            </div>
          </div>
        </Link>
      </div>

      {canBook && (
        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => setShowBookDialog(true)}>
            Reservar asiento
          </Button>
          {isAuthenticated && (
            <Button variant="outline" size="icon" onClick={() => void handleChat()}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <Button className="w-full" asChild>
          <Link to="/auth/login">Inicia sesión para reservar</Link>
        </Button>
      )}

      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar reserva</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {ride.origin} → {ride.destination} · ${ride.pricePerSeat.toLocaleString()}
            </p>
            <Textarea
              placeholder="Mensaje al conductor (opcional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void handleBook()} disabled={createBooking.isPending}>
              {createBooking.isPending ? 'Solicitando...' : 'Confirmar reserva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
