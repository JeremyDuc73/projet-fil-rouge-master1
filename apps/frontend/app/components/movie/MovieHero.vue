<template>
  <div v-if="movie" class="relative h-[70vh] min-h-[500px] overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0">
      <img
        v-if="heroBackdrop"
        :src="heroBackdrop"
        :alt="movie.title"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <div
        v-else
        class="w-full h-full"
        :style="{ backgroundColor: getColorFromTitle(movie.title) }"
      />
      
      <!-- Gradients -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
    </div>

    <!-- Content -->
    <div class="relative h-full container mx-auto px-4 flex items-center">
      <div class="max-w-2xl space-y-6">
        <!-- Title -->
        <h1 ref="titleRef" class="text-4xl md:text-6xl font-bold text-white opacity-0">
          {{ movie.title }}
        </h1>

        <!-- Meta -->
        <div ref="metaRef" class="flex flex-wrap items-center gap-4 text-white/90 opacity-0">
          <!-- TMDB Rating -->
          <div v-if="movie.tmdb_rating && parseFloat(movie.tmdb_rating) > 0" class="flex items-center gap-2 bg-yellow-500 text-black px-3 py-1.5 rounded-lg font-bold shadow-lg">
            <Icon name="ph:star-fill" class="w-4 h-4" />
            <span>{{ parseFloat(movie.tmdb_rating).toFixed(1) }}/10</span>
            <span class="text-xs opacity-75">TMDB</span>
          </div>
          
          <!-- Community Rating (only on detail page, shown even with TMDB rating) -->
          <div v-if="communityRating && communityRating.ratings_count > 0" class="flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold shadow-lg">
            <Icon name="ph:users-three" class="w-4 h-4" />
            <span>{{ parseFloat(communityRating.average_rating || 0).toFixed(1) }}/5</span>
            <span class="text-xs opacity-75">({{ communityRating.ratings_count }})</span>
          </div>

          <!-- Year -->
          <span v-if="movie.release_date" class="text-lg">
            {{ new Date(movie.release_date).getFullYear() }}
          </span>

          <!-- Duration -->
          <span v-if="movie.duration" class="text-lg">
            {{ formatDuration(movie.duration) }}
          </span>

          <!-- Categories -->
          <div class="flex gap-2">
            <span
              v-for="category in movie.categories?.slice(0, 3)"
              :key="category.id"
              class="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-sm"
            >
              {{ category.name }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <p ref="descRef" class="text-lg md:text-xl text-white/90 line-clamp-3 opacity-0">
          {{ movie.description }}
        </p>

        <!-- Actions -->
        <div ref="actionsRef" class="flex flex-wrap gap-4 opacity-0">
          <UButton
            @click="goToMovie"
            size="xl"
            color="white"
            class="font-bold backdrop-blur-sm"
          >
            <Icon name="ph:info" class="w-5 h-5 mr-2" />
            Plus d'infos
          </UButton>

          <!-- Favorites & Watchlist (if authenticated) -->
          <ClientOnly>
            <div v-if="isAuthenticated" class="flex gap-2">
              <button
                @click="toggleFavorite"
                class="flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm transition-all border cursor-pointer"
                :class="isFavorite 
                  ? 'bg-red-500/90 hover:bg-red-600 border-red-400 animate-pulse' 
                  : 'bg-white/20 hover:bg-white/30 border-white/30'"
                :title="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
              >
                <Icon :name="isFavorite ? 'ph:heart-fill' : 'ph:heart'" 
                  class="w-6 h-6 text-white transition-transform"
                  :class="{ 'scale-110': isFavorite }" 
                />
              </button>

              <button
                @click="toggleWatchlist"
                class="flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm transition-colors border cursor-pointer"
                :class="isInWatchlist 
                  ? 'bg-blue-500/90 hover:bg-blue-600 border-blue-400' 
                  : 'bg-white/20 hover:bg-white/30 border-white/30'"
                :title="isInWatchlist ? 'Retirer de la watchlist' : 'Ajouter à la watchlist'"
              >
                <Icon :name="isInWatchlist ? 'ph:bookmark-simple-fill' : 'ph:bookmark-simple'" class="w-6 h-6 text-white" />
              </button>
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
      <Icon name="ph:caret-down" class="w-8 h-8 text-white/50" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import type { Movie } from '@/utils/types'

const props = defineProps<{
  movie: Movie
  communityRating?: {
    average_rating: number
    ratings_count: number
  } | null
}>()

const router = useRouter()
const toast = useToast()
const { isAuthenticated } = useAuth()
const favoritesStore = useFavoritesStore()
const watchlistStore = useWatchlistStore()

const titleRef = ref<HTMLElement | null>(null)
const metaRef = ref<HTMLElement | null>(null)
const descRef = ref<HTMLElement | null>(null)
const actionsRef = ref<HTMLElement | null>(null)

const isFavorite = computed(() => favoritesStore.isFavorite(props.movie.id))
const isInWatchlist = computed(() => watchlistStore.isInWatchlist(props.movie.id))

// Prioritize first gallery image over backdrop_url
const heroBackdrop = computed(() => {
  // First: check gallery
  if (props.movie.gallery && props.movie.gallery.length > 0) {
    const firstImage = props.movie.gallery[0].url
    if (firstImage.startsWith('http')) return firstImage
  }
  
  // Fallback: use backdrop_url
  if (props.movie.backdrop_url) {
    return getBackdropUrl(props.movie.backdrop_url)
  }
  
  return ''
})

const getBackdropUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const config = useRuntimeConfig()
  return `${config.public.apiUrl}${url}`
}

const getColorFromTitle = (title: string) => {
  const colors = [
    '#1e3a8a', '#7c2d12', '#064e3b', '#581c87', 
    '#881337', '#0c4a6e', '#713f12', '#4c1d95'
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

// GSAP animations on mount
onMounted(() => {
  const tl = gsap.timeline()

  tl.to(titleRef.value, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out'
  })
  .to(metaRef.value, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out'
  }, '-=0.4')
  .to(descRef.value, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out'
  }, '-=0.3')
  .to(actionsRef.value, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out'
  }, '-=0.3')
})
</script>
