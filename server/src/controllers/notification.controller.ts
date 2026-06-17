import type { Request, Response } from 'express';
import { notificationService } from '../services/notification.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const notifications = await notificationService.list(req.user!.id);
    const unread = await notificationService.countUnread(req.user!.id);
    res.json({ notifications, unread });
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markAsRead(req.params['id']!, req.user!.id);
    res.json({ notification });
  }),

  markAllAsRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ message: 'Notificaciones marcadas como leídas' });
  }),
};
