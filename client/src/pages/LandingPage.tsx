import { useEffect, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Car, MapPin, Clock, ChevronRight, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useSearchRides } from '@/hooks/useRides';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Ride } from '@/types';

function RouteItem({ ride }: { ride: Ride }): ReactElement {
  const driver = ride.driver;
  const initials = `${driver.firstName[0] ?? ''}${driver.lastName[0] ?? ''}`.toUpperCase();

  return (
    <Link to={`/rides/${ride._id}`}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm hover:shadow-md transition-shadow"
      >
        <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/20">
          <AvatarImage src={driver.photoUrl} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <span className="truncate">{ride.origin}</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{ride.destination}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {format(new Date(ride.departureAt), 'HH:mm', { locale: es })}
            </span>
            {driver.ratingAverage > 0 && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {driver.ratingAverage.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-primary">${ride.pricePerSeat.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">MXN</p>
        </div>
      </motion.div>
    </Link>
  );
}

export default function LandingPage(): ReactElement {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const { data, isLoading: ridesLoading } = useSearchRides({});

  if (isLoading) {
    return (
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-40" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <></>;

  const initials = user
    ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
    : '';

  return (
    <div className="space-y-6 pt-1">
      {/* Greeting */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <p className="text-sm text-muted-foreground">Buenos días,</p>
          <h1 className="text-2xl font-bold">Hola, {user?.firstName}!</h1>
        </div>
        <Link to="/profile">
          <Avatar className="h-12 w-12 border-2 border-primary shadow-sm">
            <AvatarImage src={user?.photoUrl} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </motion.div>

      {/* Action cards */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <Link to="/rides" className="group">
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-white p-5 shadow-sm transition-all group-hover:bg-primary/5 dark:bg-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-primary">Search Ride</span>
          </div>
        </Link>

        <Link to="/rides/publish" className="group">
          <div
            className="flex flex-col items-center justify-center gap-2 rounded-2xl p-5 shadow-sm transition-all group-hover:brightness-95"
            style={{ backgroundColor: '#F5B800' }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/30">
              <Car className="h-5 w-5 text-[#1A3785]" />
            </div>
            <span className="text-sm font-semibold text-[#1A3785]">Offer Ride</span>
          </div>
        </Link>
      </motion.div>

      {/* Nearby routes */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Nearby Routes</h2>
          <Link to="/rides" className="flex items-center gap-0.5 text-xs text-primary hover:underline">
            Ver todos <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {ridesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-14" />
              </div>
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <MapPin className="mx-auto mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm">No hay viajes disponibles por ahora.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data?.items.slice(0, 6).map((ride) => (
              <RouteItem key={ride._id} ride={ride} />
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
