/**
 * Generate a URL-friendly slug from a movie title
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generate a movie URL with slug (format: /movies/123-movie-title)
 */
export const getMovieUrl = (id: number, title: string): string => {
  const slug = generateSlug(title)
  return `/movies/${id}-${slug}`
}

/**
 * Extract movie ID from URL parameter (handles both "123" and "123-slug")
 */
export const extractMovieId = (param: string | string[]): number => {
  const paramStr = Array.isArray(param) ? param[0] : param
  const id = parseInt(paramStr.split('-')[0])
  return isNaN(id) ? 0 : id
}
