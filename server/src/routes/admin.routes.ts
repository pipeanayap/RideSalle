import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/users', adminController.listUsers);
router.patch('/users/:id/suspend', adminController.suspendUser);
router.patch('/users/:id/activate', adminController.activateUser);
router.get('/rides', adminController.listRides);
router.delete('/rides/:id', adminController.deleteRide);
router.get('/stats', adminController.stats);

export default router;
