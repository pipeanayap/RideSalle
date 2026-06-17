import { Router } from 'express';
import { rideController } from '../controllers/ride.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createRideSchema,
  searchRidesSchema,
  updateRideSchema,
} from '../validation/ride.schema.js';

const router = Router();

router.get('/', validate(searchRidesSchema), rideController.search);
router.get('/my', authenticate, rideController.myRides);
router.get('/:id', rideController.getById);
router.post('/', authenticate, validate(createRideSchema), rideController.create);
router.patch('/:id', authenticate, validate(updateRideSchema), rideController.update);
router.patch('/:id/cancel', authenticate, rideController.cancel);
router.patch('/:id/complete', authenticate, rideController.complete);

export default router;
