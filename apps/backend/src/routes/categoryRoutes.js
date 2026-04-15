import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
    categoryIdParam,
    createCategoryRules,
    updateCategoryRules,
} from '../validators/category.js';

const router = Router();

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryIdParam, validateRequest, categoryController.getCategoryById);
router.post('/', createCategoryRules, validateRequest, categoryController.createCategory);
router.put('/:id', ...updateCategoryRules, validateRequest, categoryController.updateCategory);
router.delete('/:id', categoryIdParam, validateRequest, categoryController.deleteCategory);

export default router;
