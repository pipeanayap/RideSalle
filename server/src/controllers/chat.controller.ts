import type { Request, Response } from 'express';
import { chatService } from '../services/chat.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { SendMessageInput } from '../validation/chat.schema.js';

export const chatController = {
  listChats: asyncHandler(async (req: Request, res: Response) => {
    const chats = await chatService.listForUser(req.user!.id);
    res.json({ chats });
  }),

  getChat: asyncHandler(async (req: Request, res: Response) => {
    const chat = await chatService.getChat(req.params['id']!, req.user!.id);
    res.json({ chat });
  }),

  getMessages: asyncHandler(async (req: Request, res: Response) => {
    const messages = await chatService.getMessages(req.params['id']!, req.user!.id);
    res.json({ messages });
  }),

  sendMessage: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as SendMessageInput;
    const message = await chatService.sendMessage(req.user!.id, input);
    res.status(201).json({ message });
  }),

  joinByRide: asyncHandler(async (req: Request, res: Response) => {
    const chat = await chatService.getOrJoinChatByRide(req.params['rideId']!, req.user!.id);
    res.json({ chat });
  }),
};
