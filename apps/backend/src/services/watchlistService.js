import watchlistRepository from '../repositories/watchlistRepository.js';
import movieRepository from '../repositories/movieRepository.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

class WatchlistService {
    async addToWatchlist(userId, movieId) {
        const movie = await movieRepository.findById(movieId);
        if (!movie) {
            throw new NotFoundError('Movie');
        }

        const watchlistItem = await watchlistRepository.addToWatchlist(userId, movieId);
        
        return {
            success: true,
            message: watchlistItem ? 'Movie added to watchlist' : 'Movie already in watchlist',
            inWatchlist: true
        };
    }

    async removeFromWatchlist(userId, movieId) {
        const result = await watchlistRepository.removeFromWatchlist(userId, movieId);
        
        if (!result) {
            throw new NotFoundError('Watchlist item');
        }

        return {
            success: true,
            message: 'Movie removed from watchlist',
            inWatchlist: false
        };
    }

    async getUserWatchlist(userId, options) {
        return watchlistRepository.getUserWatchlist(userId, options);
    }

    async isInWatchlist(userId, movieId) {
        return watchlistRepository.isInWatchlist(userId, movieId);
    }

    async updateStatus(userId, movieId, status) {
        const validStatuses = ['to_watch', 'watched', 'dropped'];
        
        if (!validStatuses.includes(status)) {
            throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        // Vérifier que le film est dans la watchlist
        const isInWatchlist = await watchlistRepository.isInWatchlist(userId, movieId);
        if (!isInWatchlist) {
            throw new NotFoundError('Movie not in watchlist');
        }

        const result = await watchlistRepository.updateStatus(userId, movieId, status);
        
        return {
            success: true,
            message: 'Status updated',
            status: result.status
        };
    }

    async getWatchlistStats(userId) {
        return watchlistRepository.getWatchlistStats(userId);
    }
}

export default new WatchlistService();
