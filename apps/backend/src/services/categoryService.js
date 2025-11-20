import categoryRepository from '../repositories/categoryRepository.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

class CategoryService {
    async getAllCategories() {
        return categoryRepository.findAll({}, { orderBy: 'name' });
    }

    async getCategoryById(id) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new NotFoundError('Category');
        }
        return category;
    }

    async getCategoryBySlug(slug) {
        const category = await categoryRepository.findBySlug(slug);
        if (!category) {
            throw new NotFoundError('Category');
        }
        return category;
    }

    async createCategory(data) {
        const existing = await categoryRepository.findBySlug(data.slug);
        if (existing) {
            throw new ConflictError('Category with this slug already exists');
        }
        return categoryRepository.create(data);
    }

    async updateCategory(id, data) {
        const category = await this.getCategoryById(id);
        
        if (data.slug && data.slug !== category.slug) {
            const existing = await categoryRepository.findBySlug(data.slug);
            if (existing) {
                throw new ConflictError('Category with this slug already exists');
            }
        }

        return categoryRepository.update(id, data);
    }

    async deleteCategory(id) {
        const category = await this.getCategoryById(id);
        return categoryRepository.delete(id);
    }
}

export default new CategoryService();
