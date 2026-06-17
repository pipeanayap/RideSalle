import type { ReactElement } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Notification } from '@/types';

function NotificationItem({ notification, onRead }: {
  notification: Notification;
  onRead: (id: string) => void;
}): ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border p-4 space-y-1 cursor-pointer transition-colors',
        notification.read ? 'bg-card' : 'bg-primary/5 border-primary/20',
      )}
      onClick={() => !notification.read && onRead(notification._id)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn('text-sm', !notification.read && 'font-semibold')}>{notification.title}</p>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDistanceToNow(new Date(notification.createdAt), { locale: es, addSuffix: true })}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{notification.body}</p>
    </motion.div>
  );
}

export default function NotificationsPage(): ReactElement {
  const { notifications, unread, isLoading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          {unread > 0 && (
            <p className="text-sm text-muted-foreground">{unread} sin leer</p>
          )}
        </div>
        {unread > 0 && (
          <Button variant="ghost" size="sm" onClick={() => void markAllAsRead()}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Marcar todas
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Bell className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p>No tienes notificaciones aún.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationItem
              key={n._id}
              notification={n}
              onRead={(id) => void markAsRead(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
