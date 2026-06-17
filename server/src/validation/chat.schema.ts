import { z } from 'zod';
import { objectIdSchema } from './common.schema.js';

export const sendMessageSchema = z.object({
  body: z.object({
    chatId: objectIdSchema,
    content: z.string().trim().min(1).max(2000),
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];
