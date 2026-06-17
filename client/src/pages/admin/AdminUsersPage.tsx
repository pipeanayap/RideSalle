import { useState, type ReactElement } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { adminApi } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/types';

function UserRow({ user }: { user: User }): ReactElement {
  const qc = useQueryClient();
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  const suspend = useMutation({
    mutationFn: () => adminApi.suspendUser(user._id),
    onSuccess: () => {
      toast.success('Usuario suspendido');
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const activate = useMutation({
    mutationFn: () => adminApi.activateUser(user._id),
    onSuccess: () => {
      toast.success('Usuario activado');
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 rounded-lg border bg-card p-3"
    >
      <Avatar className="h-9 w-9">
        <AvatarImage src={user.photoUrl} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
          {user.status === 'active' ? 'Activo' : 'Suspendido'}
        </Badge>
        {user.status === 'active' ? (
          <Button size="sm" variant="destructive" onClick={() => void suspend.mutateAsync()} disabled={suspend.isPending}>
            Suspender
          </Button>
        ) : (
          <Button size="sm" onClick={() => void activate.mutateAsync()} disabled={activate.isPending}>
            Activar
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function AdminUsersPage(): ReactElement {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: () => adminApi.listUsers(page, 20, search || undefined),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-sm text-muted-foreground">Gestiona los usuarios de la plataforma</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1"
        />
        <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data?.items.map((u) => <UserRow key={u._id} user={u} />)}
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
