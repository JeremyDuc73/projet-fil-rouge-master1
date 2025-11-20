import { describe, it, expect } from 'vitest'

// Tests de transformation d'URL
describe('Image URL Utils', () => {
  it('should detect local vs remote URLs', () => {
    const isLocalUrl = (url: string) => url.startsWith('/uploads')
    const isAbsoluteUrl = (url: string) => url.startsWith('http')

    expect(isLocalUrl('/uploads/poster.jpg')).toBe(true)
    expect(isLocalUrl('/abc123.jpg')).toBe(false)
    expect(isAbsoluteUrl('https://example.com/image.jpg')).toBe(true)
  })

  it('should build TMDB image URLs', () => {
    const buildTMDBUrl = (path: string, size: string = 'w500') => {
      return `https://image.tmdb.org/t/p/${size}${path}`
    }

    expect(buildTMDBUrl('/abc123.jpg', 'w500')).toBe('https://image.tmdb.org/t/p/w500/abc123.jpg')
    expect(buildTMDBUrl('/backdrop.jpg', 'original')).toBe('https://image.tmdb.org/t/p/original/backdrop.jpg')
  })

  it('should handle empty or null values', () => {
    const getImageUrl = (path: string | null | undefined) => {
      if (!path) return '/placeholder.jpg'
      return path
    }

    expect(getImageUrl('')).toBe('/placeholder.jpg')
    expect(getImageUrl(null)).toBe('/placeholder.jpg')
    expect(getImageUrl(undefined)).toBe('/placeholder.jpg')
    expect(getImageUrl('/valid.jpg')).toBe('/valid.jpg')
  })
})
