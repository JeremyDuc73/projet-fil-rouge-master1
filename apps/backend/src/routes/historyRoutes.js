import { Router } from 'express';
import * as historyController from '../controllers/historyController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.get('/', authenticate, historyController.getMyHistory);
router.post('/:movieId', authenticate, historyController.trackView);
router.delete('/', authenticate, historyController.clearHistory);

export default router;
