import { Router } from 'express';
import { ratingController } from '../controllers/rating.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createRatingSchema } from '../validation/rating.schema.js';

const router = Router();

router.get('/user/:id', ratingController.listForUser);
router.post('/', authenticate, validate(createRatingSchema), ratingController.create);

export default router;
