import type { Server as HttpServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { chatService } from '../services/chat.service.js';
import { logger } from '../config/logger.js';

export let io: SocketServer | null = null;

export function getIo(): SocketServer {
  if (!io) throw new Error('Socket.io no inicializado');
  return io;
}

export function initSockets(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
    transports: ['websocket', 'polling'],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined;
    if (!token) return next(new Error('Token requerido'));
    try {
      const payload = verifyAccessToken(token);
      socket.data['userId'] = payload.sub;
      socket.data['role'] = payload.role;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data['userId'] as string;
    logger.debug(`Socket conectado: ${userId}`);

    socket.join(`user:${userId}`);

    socket.on('chat:join', (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('chat:leave', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('chat:send', async (data: { chatId: string; content: string }) => {
      try {
        const message = await chatService.sendMessage(userId, {
          chatId: data.chatId,
          content: data.content,
        });
        io!.to(`chat:${data.chatId}`).emit('chat:message', message);
      } catch (err) {
        socket.emit('chat:error', { message: (err as Error).message });
      }
    });

    socket.on('chat:typing', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('chat:typing', { userId, chatId });
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket desconectado: ${userId}`);
    });
  });

  return io;
}

export function emitToUser(userId: string, event: string, data: unknown): void {
  io?.to(`user:${userId}`).emit(event, data);
}
