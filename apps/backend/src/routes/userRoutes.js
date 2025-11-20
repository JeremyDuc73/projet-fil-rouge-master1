import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, userController.updateMe);
router.patch('/me/password', authenticate, userController.updatePassword);

router.get('/', authenticate, requireAdmin, userController.getAllUsers);
router.get('/:id', authenticate, requireAdmin, userController.getUserById);
router.patch('/:id/role', authenticate, requireAdmin, userController.updateUserRole);
router.delete('/:id', authenticate, requireAdmin, userController.deleteUser);

export default router;
