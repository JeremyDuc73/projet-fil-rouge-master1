export const useImageUrl = () => {
  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) {
      // Image placeholder grise avec icône film
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM3NDE1MSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Ob8KgUG9zdGVyPC90ZXh0Pjwvc3ZnPg=='
    }
    
    // Si l'URL commence par http/https, c'est une URL complète (TMDB)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // Sinon, c'est une URL relative, on ajoute l'URL du backend
    const baseURL = 'http://localhost:3001'
    return `${baseURL}${url}`
  }
  
  return {
    getImageUrl
  }
}
