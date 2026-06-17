import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateRide } from '@/hooks/useRides';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const schema = z.object({
  origin: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  destination: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  departureAt: z.string().min(1, 'Selecciona fecha y hora'),
  meetingPoint: z.string().min(2, 'Indica el punto de encuentro').max(160),
  pricePerSeat: z.coerce.number().min(0, 'Precio no puede ser negativo').max(100000),
  totalSeats: z.coerce.number().int().min(1).max(8),
  description: z.string().max(500).optional(),
});
type FormData = z.infer<typeof schema>;

export default function PublishRidePage(): ReactElement {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createRide = useCreateRide();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (!user?.vehicle) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-muted-foreground">Necesitas registrar un vehículo antes de publicar viajes.</p>
        <Button asChild>
          <Link to="/profile">Ir a mi perfil</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(data: FormData) {
    try {
      const ride = await createRide.mutateAsync({
        ...data,
        departureAt: new Date(data.departureAt).toISOString(),
      });
      toast.success('Viaje publicado exitosamente');
      navigate(`/rides/${ride._id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al publicar viaje');
    }
  }

  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() + 30);
  const minDateStr = minDate.toISOString().slice(0, 16);

  return (
    <motion.div
      className="space-y-5 pb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-2xl font-bold">Publicar viaje</h1>
        <p className="text-sm text-muted-foreground">Ofrece asientos a tus compañeros</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="origin">Origen</Label>
            <Input id="origin" placeholder="Ej: Celaya, Gto." {...register('origin')} />
            {errors.origin && <p className="text-xs text-destructive">{errors.origin.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="destination">Destino</Label>
            <Input id="destination" placeholder="Ej: León, Gto." {...register('destination')} />
            {errors.destination && <p className="text-xs text-destructive">{errors.destination.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="meetingPoint">Punto de encuentro</Label>
          <Input id="meetingPoint" placeholder="Ej: Estacionamiento principal campus" {...register('meetingPoint')} />
          {errors.meetingPoint && <p className="text-xs text-destructive">{errors.meetingPoint.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="departureAt">Fecha y hora de salida</Label>
          <Input id="departureAt" type="datetime-local" min={minDateStr} {...register('departureAt')} />
          {errors.departureAt && <p className="text-xs text-destructive">{errors.departureAt.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="pricePerSeat">Precio por asiento (MXN)</Label>
            <Input id="pricePerSeat" type="number" min={0} step={5} {...register('pricePerSeat')} />
            {errors.pricePerSeat && <p className="text-xs text-destructive">{errors.pricePerSeat.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="totalSeats">
              Asientos disponibles (max. {user.vehicle.seats})
            </Label>
            <Input
              id="totalSeats"
              type="number"
              min={1}
              max={user.vehicle.seats}
              {...register('totalSeats')}
            />
            {errors.totalSeats && <p className="text-xs text-destructive">{errors.totalSeats.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea
            id="description"
            placeholder="Información adicional sobre el viaje..."
            rows={3}
            {...register('description')}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Publicando...' : 'Publicar viaje'}
        </Button>
      </form>
    </motion.div>
  );
}
