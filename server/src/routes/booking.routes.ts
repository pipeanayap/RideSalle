import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createBookingSchema } from '../validation/booking.schema.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createBookingSchema), bookingController.create);
router.get('/my', bookingController.myBookingsAsPassenger);
router.get('/pending-driver', bookingController.pendingAsDriver);
router.get('/:id', bookingController.getById);
router.patch('/:id/accept', bookingController.accept);
router.patch('/:id/reject', bookingController.reject);
router.patch('/:id/cancel', bookingController.cancel);

export default router;
