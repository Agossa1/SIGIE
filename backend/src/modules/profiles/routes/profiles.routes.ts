import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { GetProfileController } from '../controllers/get-profile.controller';
import { UpdateProfileController } from '../controllers/update-profile.controller';

export function configureProfilesRouter(
    getProfileCtrl: GetProfileController,
    updateProfileCtrl: UpdateProfileController,
): Router {
    const router = Router();
    router.use(authMiddleware);

    router.get('/', getProfileCtrl.handle);
    router.put('/', updateProfileCtrl.handle);

    return router;
}