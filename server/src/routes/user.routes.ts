import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  changePasswordSchema,
  updateProfileSchema,
  vehicleSchema,
} from '../validation/user.schema.js';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', validate(updateProfileSchema), userController.updateMe);
router.post('/me/photo', userController.uploadPhoto);
router.post('/me/vehicle', validate(vehicleSchema), userController.setVehicle);
router.delete('/me/vehicle', userController.deleteVehicle);
router.post('/me/change-password', validate(changePasswordSchema), userController.changePassword);
router.get('/:id', userController.getPublicProfile);

export default router;
