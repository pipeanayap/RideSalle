import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSearchRides } from '@/hooks/useRides';
import type { Ride } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function RideCard({ ride }: { ride: Ride }): ReactElement {
  const driver = ride.driver;
  const initials = `${driver.firstName[0] ?? ''}${driver.lastName[0] ?? ''}`.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <Link to={`/rides/${ride._id}`} className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {ride.origin}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <ChevronRight className="h-3.5 w-3.5" />
              {ride.destination}
            </div>
          </div>
          <span className="text-lg font-bold text-primary">
            ${ride.pricePerSeat.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(ride.departureAt), "d 'de' MMM 'a las' HH:mm", { locale: es })}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {ride.seatsAvailable} asiento(s)
          </div>
        </div>

        <div className="flex items-center gap-2 border-t pt-3">
          <Avatar className="h-7 w-7">
            <AvatarImage src={driver.photoUrl} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm">
            {driver.firstName} {driver.lastName}
          </span>
          {driver.ratingAverage > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">
              ⭐ {driver.ratingAverage.toFixed(1)}
            </Badge>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function RideCardSkeleton(): ReactElement {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-3 w-48" />
      <div className="flex items-center gap-2 border-t pt-3">
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
}

export default function RidesPage(): ReactElement {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [searchParams, setSearchParams] = useState({});

  const { data, isLoading } = useSearchRides(searchParams);

  function handleSearch() {
    setSearchParams({ origin: origin || undefined, destination: destination || undefined });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Buscar viajes</h1>
        <p className="text-sm text-muted-foreground">Encuentra un viaje cercano a ti</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Origen"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="sm:flex-1"
        />
        <Input
          placeholder="Destino"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="sm:flex-1"
        />
        <Button onClick={handleSearch} className="sm:w-auto">
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <RideCardSkeleton key={i} />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Car className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p>No hay viajes disponibles con esos criterios.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data?.items.map((ride) => <RideCard key={ride._id} ride={ride} />)}
        </div>
      )}
    </div>
  );
}

function Car(props: React.SVGProps<SVGSVGElement>): ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5" /><circle cx="16" cy="17" r="2" /><circle cx="9" cy="17" r="2" />
    </svg>
  );
}
