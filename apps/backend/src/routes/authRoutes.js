import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { loginRules, refreshRules, registerRules } from '../validators/auth.js';

const router = Router();

router.post('/register', ...registerRules, validateRequest, authController.register);
router.post('/login', ...loginRules, validateRequest, authController.login);
router.post('/refresh', ...refreshRules, validateRequest, authController.refresh);
router.post('/logout', authenticate, authController.logout);

export default router;
