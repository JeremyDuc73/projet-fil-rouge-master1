import categoryService from '../services/categoryService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await categoryService.getAllCategories();
    
    res.json({
        success: true,
        data: categories
    });
});

export const getCategoryById = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);
    
    res.json({
        success: true,
        data: category
    });
});

export const createCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body);
    
    res.status(201).json({
        success: true,
        data: category
    });
});

export const updateCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    
    res.json({
        success: true,
        data: category
    });
});

export const deleteCategory = asyncHandler(async (req, res) => {
    await categoryService.deleteCategory(req.params.id);
    
    res.json({
        success: true,
        message: 'Category deleted successfully'
    });
});
