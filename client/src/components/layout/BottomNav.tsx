import { NavLink } from 'react-router-dom';
import { Home, Search, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

const navItems = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/rides', icon: Search, label: 'Buscar', exact: false },
  { to: '/chats', icon: MessageSquare, label: 'Chats', exact: false, requireAuth: true },
  { to: '/profile', icon: User, label: 'Perfil', exact: false, requireAuth: true },
];

export function BottomNav() {
  const { isAuthenticated } = useAuth();
  const { unread } = useNotifications();

  const visible = navItems.filter((i) => !i.requireAuth || isAuthenticated);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/90 backdrop-blur-md dark:bg-background/90 sm:hidden">
      <div className="flex h-16 items-stretch">
        {visible.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-all',
                  isActive && 'bg-primary/10',
                )}>
                  <Icon className="h-5 w-5" />
                  {to === '/chats' && unread > 0 && (
                    <span className="absolute top-1.5 right-[calc(50%-14px)] flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] text-white font-bold">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
