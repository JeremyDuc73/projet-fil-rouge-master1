import ratingRepository from '../repositories/ratingRepository.js';
import movieRepository from '../repositories/movieRepository.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';
import { RATING_RANGE } from '../utils/constants.js';

class RatingService {
    async addOrUpdateRating(userId, movieId, ratingData) {
        const { rating, review } = ratingData;

        const movie = await movieRepository.findById(movieId);
        if (!movie) {
            throw new NotFoundError('Movie');
        }

        if (!rating || rating < RATING_RANGE.MIN || rating > RATING_RANGE.MAX) {
            throw new ValidationError(`Rating must be between ${RATING_RANGE.MIN} and ${RATING_RANGE.MAX}`);
        }

        const existingRating = await ratingRepository.findByUserAndMovie(userId, movieId);

        if (existingRating) {
            return ratingRepository.updateRating(userId, movieId, rating, review);
        } else {
            return ratingRepository.createRating(userId, movieId, rating, review);
        }
    }

    async deleteRating(userId, movieId) {
        const rating = await ratingRepository.findByUserAndMovie(userId, movieId);
        if (!rating) {
            throw new NotFoundError('Rating');
        }

        return ratingRepository.deleteByUserAndMovie(userId, movieId);
    }

    async getMovieRatings(movieId, options) {
        const movie = await movieRepository.findById(movieId);
        if (!movie) {
            throw new NotFoundError('Movie');
        }

        // Get stats
        const stats = await ratingRepository.getMovieRatingStats(movieId);
        
        // Get ratings list
        const ratings = await ratingRepository.getMovieRatings(movieId, options);

        return {
            averageRating: parseFloat(stats.average_rating).toFixed(2),
            ratingsCount: stats.ratings_count,
            ratings
        };
    }

    async getUserRatings(userId, options) {
        return ratingRepository.getUserRatings(userId, options);
    }

    async getUserRating(userId, movieId) {
        return ratingRepository.findByUserAndMovie(userId, movieId);
    }
}

export default new RatingService();
