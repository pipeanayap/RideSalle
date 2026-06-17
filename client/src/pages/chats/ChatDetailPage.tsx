import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { chatsApi } from '@/api/chats';
import { useAuth } from '@/context/AuthContext';
import type { Message } from '@/types';

export default function ChatDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: chat, isLoading: loadingChat } = useQuery({
    queryKey: ['chats', id],
    queryFn: () => chatsApi.getById(id!),
    enabled: !!id,
  });

  const { data: initialMessages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => chatsApi.getMessages(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || !id) return;

    const s = io({ auth: { token }, transports: ['websocket', 'polling'] });
    s.emit('chat:join', id);

    s.on('chat:message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      void qc.invalidateQueries({ queryKey: ['chats'] });
    });

    setSocket(s);
    return () => {
      s.emit('chat:leave', id);
      s.disconnect();
    };
  }, [id, qc]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!content.trim() || !id) return;
    const text = content.trim();
    setContent('');

    if (socket?.connected) {
      socket.emit('chat:send', { chatId: id, content: text });
    } else {
      const msg = await chatsApi.sendMessage(id, text);
      setMessages((prev) => [...prev, msg]);
    }
  }

  const isLoading = loadingChat || loadingMessages;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    );
  }

  const others = chat?.participants.filter((p) => p._id !== user?._id && (p as unknown as {id:string}).id !== user?.id);
  const other = others?.[0];
  const title = other ? `${other.firstName} ${other.lastName}` : 'Chat';

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col">
      <div className="flex items-center gap-3 border-b pb-3 mb-3 shrink-0">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/chats"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        {other && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={other.photoUrl} />
            <AvatarFallback>{`${other.firstName[0] ?? ''}${other.lastName[0] ?? ''}`.toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        <div>
          <p className="font-medium text-sm">{title}</p>
          {chat && (
            <p className="text-xs text-muted-foreground">
              {chat.ride.origin} → {chat.ride.destination}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.sender._id === user?._id || (msg.sender as unknown as {id:string}).id === user?.id;
            const senderInitials = `${msg.sender.firstName[0] ?? ''}${msg.sender.lastName[0] ?? ''}`.toUpperCase();

            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {!isMe && (
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarImage src={msg.sender.photoUrl} />
                    <AvatarFallback className="text-[10px]">{senderInitials}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                  isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-0.5 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {format(new Date(msg.createdAt), 'HH:mm')}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t pt-3 shrink-0">
        <Input
          placeholder="Escribe un mensaje..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }}}
          className="flex-1"
        />
        <Button size="icon" onClick={() => void handleSend()} disabled={!content.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
