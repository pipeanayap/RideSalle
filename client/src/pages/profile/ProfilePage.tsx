import { useRef, useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Camera, Car, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/api/users';

const profileSchema = z.object({
  firstName: z.string().min(2).max(60),
  lastName: z.string().min(2).max(60),
  university: z.string().min(2).max(120),
  career: z.string().min(2).max(120),
  semester: z.coerce.number().int().min(1).max(20),
  description: z.string().max(500).optional(),
});

const vehicleSchema = z.object({
  brand: z.string().min(1).max(40),
  model: z.string().min(1).max(40),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  color: z.string().min(1).max(30),
  plates: z.string().min(3).max(12),
  seats: z.coerce.number().int().min(1).max(8),
});

type ProfileData = z.infer<typeof profileSchema>;
type VehicleData = z.infer<typeof vehicleSchema>;

function ProfileTab(): ReactElement {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      university: user?.university ?? '',
      career: user?.career ?? '',
      semester: user?.semester ?? 1,
      description: user?.description ?? '',
    },
  });

  async function onSubmit(data: ProfileData) {
    try {
      await usersApi.updateMe(data);
      await refreshUser();
      toast.success('Perfil actualizado');
    } catch {
      toast.error('Error al actualizar el perfil');
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await usersApi.uploadPhoto(reader.result as string);
          await refreshUser();
          toast.success('Foto actualizada');
        } catch {
          toast.error('Error al subir la foto');
        } finally {
          setUploadingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingPhoto(false);
    }
  }

  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.photoUrl} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <Button
            variant="secondary"
            size="icon"
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingPhoto}
          >
            <Camera className="h-3.5 w-3.5" />
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handlePhotoChange(e)} />
        </div>
        <div>
          <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {user?.ratingAverage && user.ratingAverage > 0 ? user.ratingAverage.toFixed(1) : 'Sin calificaciones'}
          </div>
          <p className="text-xs text-muted-foreground">{user?.ridesPublished} viajes · {user?.ridesCompleted} como pasajero</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input {...register('firstName')} />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Apellidos</Label>
            <Input {...register('lastName')} />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Universidad</Label>
          <Input {...register('university')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Carrera</Label>
            <Input {...register('career')} />
          </div>
          <div className="space-y-1.5">
            <Label>Semestre</Label>
            <Input type="number" min={1} max={20} {...register('semester')} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Descripción</Label>
          <Textarea rows={3} placeholder="Cuéntanos sobre ti..." {...register('description')} />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>
    </div>
  );
}

function VehicleTab(): ReactElement {
  const { user, refreshUser } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<VehicleData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: user?.vehicle ?? { seats: 4, year: new Date().getFullYear() },
  });

  async function onSubmit(data: VehicleData) {
    try {
      await usersApi.setVehicle(data);
      await refreshUser();
      toast.success('Vehículo guardado');
    } catch {
      toast.error('Error al guardar el vehículo');
    }
  }

  async function handleDelete() {
    try {
      await usersApi.deleteVehicle();
      await refreshUser();
      toast.success('Vehículo eliminado');
    } catch {
      toast.error('Error al eliminar el vehículo');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Car className="h-5 w-5 text-primary" />
        <h3 className="font-medium">{user?.vehicle ? 'Mi vehículo' : 'Registrar vehículo'}</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Marca</Label>
            <Input placeholder="Nissan" {...register('brand')} />
            {errors.brand && <p className="text-xs text-destructive">{errors.brand.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Modelo</Label>
            <Input placeholder="Versa" {...register('model')} />
            {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Año</Label>
            <Input type="number" {...register('year')} />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <Input placeholder="Blanco" {...register('color')} />
          </div>
          <div className="space-y-1.5">
            <Label>Asientos</Label>
            <Input type="number" min={1} max={8} {...register('seats')} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Placas</Label>
          <Input placeholder="ABC-123-D" {...register('plates')} />
          {errors.plates && <p className="text-xs text-destructive">{errors.plates.message}</p>}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar vehículo'}
          </Button>
          {user?.vehicle && (
            <Button type="button" variant="destructive" onClick={() => void handleDelete()}>
              Eliminar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function ProfilePage(): ReactElement {
  return (
    <motion.div
      className="space-y-5 pb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-2xl font-bold">Mi perfil</h1>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="flex-1">Perfil</TabsTrigger>
          <TabsTrigger value="vehicle" className="flex-1">Vehículo</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="vehicle" className="mt-4">
          <VehicleTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
