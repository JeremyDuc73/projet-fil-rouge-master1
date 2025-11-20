import reviewRepository from '../repositories/reviewRepository.js';
import movieRepository from '../repositories/movieRepository.js';
import { NotFoundError, ValidationError, ForbiddenError, ConflictError } from '../utils/errors.js';

class ReviewService {
    async createReview(userId, movieId, reviewData) {
        const { rating, reviewText } = reviewData;

        // Validate movie exists
        const movie = await movieRepository.findById(movieId);
        if (!movie) {
            throw new NotFoundError('Movie');
        }

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            throw new ValidationError('Rating must be between 1 and 5');
        }

        // Validate review text if provided
        if (reviewText !== undefined && reviewText !== null && reviewText.trim() !== '') {
            if (reviewText.trim().length < 10) {
                throw new ValidationError('Review text must be at least 10 characters long');
            }

            if (reviewText.length > 1000) {
                throw new ValidationError('Review text must not exceed 1000 characters');
            }
        }

        // Check if user already reviewed this movie
        const existingReview = await reviewRepository.findByUserAndMovie(userId, movieId);
        if (existingReview) {
            throw new ConflictError('You have already reviewed this movie. Please update your existing review instead.');
        }

        const finalText = reviewText && reviewText.trim() ? reviewText.trim() : null;
        return reviewRepository.create(userId, movieId, rating, finalText);
    }

    async getMovieReviews(movieId, options) {
        // Validate movie exists
        const movie = await movieRepository.findById(movieId);
        if (!movie) {
            throw new NotFoundError('Movie');
        }

        const reviews = await reviewRepository.getMovieReviews(movieId, options);
        const total = await reviewRepository.countMovieReviews(movieId);

        return {
            reviews,
            total,
            page: Math.floor(options.offset / options.limit) + 1,
            totalPages: Math.ceil(total / options.limit)
        };
    }

    async getUserReviews(userId, options) {
        return reviewRepository.getUserReviews(userId, options);
    }

    async getUserReviewForMovie(userId, movieId) {
        return reviewRepository.findByUserAndMovie(userId, movieId);
    }

    async updateReview(reviewId, userId, reviewData) {
        const { rating, reviewText } = reviewData;

        // Find existing review
        const review = await reviewRepository.findById(reviewId);
        if (!review) {
            throw new NotFoundError('Review');
        }

        // Check ownership
        if (review.user_id !== userId) {
            throw new ForbiddenError('You can only update your own reviews');
        }

        // Validate rating
        if (rating && (rating < 1 || rating > 5)) {
            throw new ValidationError('Rating must be between 1 and 5');
        }

        // Validate review text if provided
        if (reviewText !== undefined && reviewText !== null && reviewText.trim() !== '') {
            if (reviewText.trim().length < 10) {
                throw new ValidationError('Review text must be at least 10 characters long');
            }

            if (reviewText.length > 1000) {
                throw new ValidationError('Review text must not exceed 1000 characters');
            }
        }

        const finalRating = rating || review.rating;
        const finalText = reviewText !== undefined 
            ? (reviewText && reviewText.trim() ? reviewText.trim() : null)
            : review.review_text;

        return reviewRepository.update(reviewId, finalRating, finalText);
    }

    async deleteReview(reviewId, userId) {
        const review = await reviewRepository.findById(reviewId);
        if (!review) {
            throw new NotFoundError('Review');
        }

        // Check ownership
        if (review.user_id !== userId) {
            throw new ForbiddenError('You can only delete your own reviews');
        }

        return reviewRepository.deleteById(reviewId);
    }
}

export default new ReviewService();
