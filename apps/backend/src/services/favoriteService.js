import favoriteRepository from '../repositories/favoriteRepository.js';
import movieRepository from '../repositories/movieRepository.js';
import { NotFoundError } from '../utils/errors.js';

class FavoriteService {
    async addFavorite(userId, movieId) {
        const movie = await movieRepository.findById(movieId);
        if (!movie) {
            throw new NotFoundError('Movie');
        }

        const favorite = await favoriteRepository.addFavorite(userId, movieId);
        
        return {
            success: true,
            message: favorite ? 'Movie added to favorites' : 'Movie already in favorites',
            isFavorite: true
        };
    }

    async removeFavorite(userId, movieId) {
        const result = await favoriteRepository.removeFavorite(userId, movieId);
        
        if (!result) {
            throw new NotFoundError('Favorite');
        }

        return {
            success: true,
            message: 'Movie removed from favorites',
            isFavorite: false
        };
    }

    async getUserFavorites(userId, options) {
        return favoriteRepository.getUserFavorites(userId, options);
    }

    async isFavorite(userId, movieId) {
        return favoriteRepository.isFavorite(userId, movieId);
    }
}

export default new FavoriteService();
