import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { chatsApi } from '@/api/chats';
import { useAuth } from '@/context/AuthContext';
import type { Chat } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

function ChatItem({ chat, myId }: { chat: Chat; myId: string }): ReactElement {
  const others = chat.participants.filter((p) => p._id !== myId && (p as unknown as { id: string }).id !== myId);
  const other = others[0] ?? chat.participants[0];
  const initials = other ? `${other.firstName[0] ?? ''}${other.lastName[0] ?? ''}`.toUpperCase() : '?';

  return (
    <Link to={`/chats/${chat._id}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
      >
        <Avatar className="h-11 w-11">
          <AvatarImage src={other?.photoUrl} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-medium text-sm truncate">
              {other ? `${other.firstName} ${other.lastName}` : 'Chat'}
            </p>
            {chat.lastMessageAt && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(chat.lastMessageAt), { locale: es, addSuffix: true })}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {chat.ride.origin} → {chat.ride.destination}
          </p>
          {chat.lastMessage && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {chat.lastMessage.content}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export default function ChatsPage(): ReactElement {
  const { user } = useAuth();
  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: chatsApi.list,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Mensajes</h1>
        <p className="text-sm text-muted-foreground">Conversaciones con conductores y pasajeros</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : chats?.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p>No tienes conversaciones aún.</p>
          <p className="text-sm mt-1">Reserva o publica un viaje para empezar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chats?.map((chat) => (
            <ChatItem key={chat._id} chat={chat} myId={user?._id ?? user?.id ?? ''} />
          ))}
        </div>
      )}
    </div>
  );
}
