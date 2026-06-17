import type { Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type {
  ChangePasswordInput,
  UpdateProfileInput,
  VehicleInput,
} from '../validation/user.schema.js';

export const userController = {
  getMe: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getById(req.user!.id);
    res.json({ user });
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as UpdateProfileInput;
    const user = await userService.updateProfile(req.user!.id, input);
    res.json({ user });
  }),

  uploadPhoto: asyncHandler(async (req: Request, res: Response) => {
    const { dataUrl } = req.body as { dataUrl: string };
    const user = await userService.updateAvatar(req.user!.id, dataUrl);
    res.json({ user });
  }),

  setVehicle: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as VehicleInput;
    const user = await userService.setVehicle(req.user!.id, input);
    res.json({ user });
  }),

  deleteVehicle: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.removeVehicle(req.user!.id);
    res.json({ user });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as ChangePasswordInput;
    await userService.changePassword(req.user!.id, input);
    res.json({ message: 'Contraseña actualizada' });
  }),

  getPublicProfile: asyncHandler(async (req: Request, res: Response) => {
    const { user, ratings } = await userService.getPublicProfile(req.params['id']!);
    res.json({ user, ratings });
  }),
};
