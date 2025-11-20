import viewingHistoryRepository from '../repositories/viewingHistoryRepository.js';
import movieRepository from '../repositories/movieRepository.js';
import { NotFoundError } from '../utils/errors.js';

class ViewingHistoryService {
    async trackView(userId, movieId) {
        const movie = await movieRepository.findById(movieId);
        if (!movie) {
            throw new NotFoundError('Movie');
        }

        return viewingHistoryRepository.addView(userId, movieId);
    }

    async getUserHistory(userId, options) {
        return viewingHistoryRepository.getUserHistory(userId, options);
    }

    async getMovieViewCount(userId, movieId) {
        return viewingHistoryRepository.getMovieViewCount(userId, movieId);
    }

    async clearHistory(userId) {
        const deleted = await viewingHistoryRepository.clearHistory(userId);
        
        return {
            success: true,
            message: 'History cleared',
            deletedCount: deleted.length
        };
    }
}

export default new ViewingHistoryService();
