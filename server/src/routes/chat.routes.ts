import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { sendMessageSchema } from '../validation/chat.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', chatController.listChats);
router.get('/:id', chatController.getChat);
router.get('/:id/messages', chatController.getMessages);
router.post('/messages', validate(sendMessageSchema), chatController.sendMessage);
router.post('/ride/:rideId/join', chatController.joinByRide);

export default router;
