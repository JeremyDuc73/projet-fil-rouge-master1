<template>
  <div 
    class="group relative rounded-lg overflow-hidden bg-gray-900 cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-2xl"
    @click="goToMovie"
  >
    <!-- Poster Image -->
    <div class="aspect-[2/3] relative overflow-hidden">
      <img
        v-if="movie.poster_url"
        :src="getPosterUrl(movie.poster_url)"
        :alt="movie.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        @error="handleImageError"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-white font-bold text-center p-4"
        :style="{ backgroundColor: getColorFromTitle(movie.title) }"
      >
        {{ movie.title }}
      </div>

      <!-- Gradient Overlay on Hover -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <!-- TMDB Rating Badge (priority) -->
      <div 
        v-if="movie.tmdb_rating && parseFloat(movie.tmdb_rating) > 0"
        class="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-lg z-10"
      >
        <Icon name="ph:star-fill" class="w-3 h-3" />
        {{ parseFloat(movie.tmdb_rating).toFixed(1) }}
      </div>
      
      <!-- Community Rating Badge (fallback if no TMDB) -->
      <div 
        v-else-if="movie.community_count && movie.community_count > 0"
        class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-lg z-10"
      >
        <Icon name="ph:users-three" class="w-3 h-3" />
        {{ parseFloat(movie.community_rating || 0).toFixed(1) }}
        <span class="text-[10px] opacity-75">({{ movie.community_count }})</span>
      </div>

      <!-- Categories -->
      <div class="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[calc(100%-80px)]">
        <span
          v-for="category in movie.categories?.slice(0, 2)"
          :key="category.id"
          class="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md"
        >
          {{ category.name }}
        </span>
      </div>
    </div>

    <!-- Info Overlay (visible on hover) -->
    <div class="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
      <h3 class="text-white font-bold text-lg mb-2 line-clamp-1">{{ movie.title }}</h3>
      
      <!-- Actions -->
      <div class="flex items-center gap-2">
        <!-- Add to favorites -->
        <button
          v-if="isAuthenticated"
          @click.stop="toggleFavorite"
          class="flex items-center justify-center w-8 h-8 rounded-full transition-all border cursor-pointer"
          :class="isFavorite 
            ? 'bg-red-500 hover:bg-red-600 border-red-400 animate-pulse' 
            : 'bg-gray-800/80 hover:bg-gray-700 border-gray-600'"
          :title="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
        >
          <Icon :name="isFavorite ? 'ph:heart-fill' : 'ph:heart'" 
            class="w-4 h-4 text-white transition-transform"
            :class="{ 'scale-110': isFavorite }" 
          />
        </button>

        <!-- Add to watchlist -->
        <button
          v-if="isAuthenticated"
          @click.stop="toggleWatchlist"
          class="flex items-center justify-center w-8 h-8 rounded-full transition-colors border cursor-pointer"
          :class="isInWatchlist 
            ? 'bg-blue-500 hover:bg-blue-600 border-blue-400' 
            : 'bg-gray-800/80 hover:bg-gray-700 border-gray-600'"
          :title="isInWatchlist ? 'Retirer de la watchlist' : 'Ajouter à la watchlist'"
        >
          <Icon :name="isInWatchlist ? 'ph:bookmark-simple-fill' : 'ph:bookmark-simple'" class="w-4 h-4 text-white" />
        </button>

        <!-- Info button -->
        <button
          @click.stop="goToMovie"
          class="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-colors border border-gray-600 cursor-pointer"
          title="Plus d'infos"
        >
          <Icon name="ph:info" class="w-4 h-4 text-white" />
        </button>
      </div>

      <!-- Duration & Year -->
      <div class="flex items-center gap-3 text-xs text-gray-300 mt-2">
        <span v-if="movie.duration">{{ formatDuration(movie.duration) }}</span>
        <span v-if="movie.release_date">{{ new Date(movie.release_date).getFullYear() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Movie } from '@/utils/types'

const props = defineProps<{
  movie: Movie
}>()

const router = useRouter()
const toast = useToast()
const { isAuthenticated } = useAuth()
const favoritesStore = useFavoritesStore()
const watchlistStore = useWatchlistStore()

// Reactive states from stores
const isFavorite = computed(() => favoritesStore.isFavorite(props.movie.id))
const isInWatchlist = computed(() => watchlistStore.isInWatchlist(props.movie.id))

const getPosterUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const config = useRuntimeConfig()
  return `${config.public.apiUrl}${url}`
}

const getColorFromTitle = (title: string) => {
  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ]
  const index = title.charCodeAt(0) % colors.length
  return colors[index]
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h${mins}min` : `${mins}min`
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

const goToMovie = () => {
  router.push(`/movies/${props.movie.id}`)
}

const toggleFavorite = async () => {
  try {
    await favoritesStore.toggleFavorite(props.movie.id)
    
    if (isFavorite.value) {
      toast.add({
        title: 'Ajouté aux favoris',
        icon: 'ph:heart-fill',
        color: 'green'
      })
    } else {
      toast.add({
        title: 'Retiré des favoris',
        color: 'gray'
      })
    }
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de modifier les favoris',
      color: 'red'
    })
  }
}

const toggleWatchlist = async () => {
  try {
    await watchlistStore.toggleWatchlist(props.movie.id)
    
    if (isInWatchlist.value) {
      toast.add({
        title: 'Ajouté à la watchlist',
        icon: 'ph:bookmark-simple-fill',
        color: 'blue'
      })
    } else {
      toast.add({
        title: 'Retiré de la watchlist',
        color: 'gray'
      })
    }
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de modifier la watchlist',
      color: 'red'
    })
  }
}
</script>
