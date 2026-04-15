import { Router } from 'express';
import * as historyController from '../controllers/historyController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { movieIdParam, paginationQuery } from '../validators/common.js';

const router = Router();

router.get('/', authenticate, ...paginationQuery, validateRequest, historyController.getMyHistory);
router.post('/:movieId', authenticate, movieIdParam, validateRequest, historyController.trackView);
router.delete('/', authenticate, historyController.clearHistory);

export default router;
