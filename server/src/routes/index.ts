import { Router } from 'express';
import authRouter from './auth.routes.js';
import userRouter from './user.routes.js';
import rideRouter from './ride.routes.js';
import bookingRouter from './booking.routes.js';
import chatRouter from './chat.routes.js';
import ratingRouter from './rating.routes.js';
import notificationRouter from './notification.routes.js';
import adminRouter from './admin.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ridesalle-api', timestamp: new Date().toISOString() });
});

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/rides', rideRouter);
router.use('/bookings', bookingRouter);
router.use('/chats', chatRouter);
router.use('/ratings', ratingRouter);
router.use('/notifications', notificationRouter);
router.use('/admin', adminRouter);

export default router;
