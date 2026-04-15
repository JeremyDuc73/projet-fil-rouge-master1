import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
    adminUserIdParam,
    listUsersQuery,
    updateMeRules,
    updatePasswordRules,
    updateUserRoleRules,
} from '../validators/user.js';

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, ...updateMeRules, validateRequest, userController.updateMe);
router.patch('/me/password', authenticate, ...updatePasswordRules, validateRequest, userController.updatePassword);

router.get('/', authenticate, requireAdmin, listUsersQuery, validateRequest, userController.getAllUsers);
router.get('/:id', authenticate, requireAdmin, adminUserIdParam, validateRequest, userController.getUserById);
router.patch('/:id/role', authenticate, requireAdmin, ...updateUserRoleRules, validateRequest, userController.updateUserRole);
router.delete('/:id', authenticate, requireAdmin, adminUserIdParam, validateRequest, userController.deleteUser);

export default router;
