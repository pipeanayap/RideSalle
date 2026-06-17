import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Car, BookOpen } from 'lucide-react';
import { adminApi } from '@/api/admin';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function AdminStatsPage(): ReactElement {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.stats,
  });

  const cards = [
    { label: 'Usuarios', value: stats?.totalUsers, icon: Users, to: '/admin/users' },
    { label: 'Viajes', value: stats?.totalRides, icon: Car, to: '/admin/rides' },
    { label: 'Reservas', value: stats?.totalBookings, icon: BookOpen, to: null },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel de administración</h1>
        <p className="text-sm text-muted-foreground">Vista general de la plataforma</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, to }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border bg-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-primary" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold">{value?.toLocaleString()}</p>
            )}
            {to && (
              <Button variant="ghost" size="sm" asChild className="p-0 h-auto text-primary">
                <Link to={to}>Ver todos →</Link>
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" asChild>
          <Link to="/admin/users">Gestionar usuarios</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/admin/rides">Gestionar viajes</Link>
        </Button>
      </div>
    </div>
  );
}
