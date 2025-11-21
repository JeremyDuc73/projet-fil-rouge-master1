<template>
  <div>
    <!-- Grid -->
    <div 
      ref="gridRef"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
      <MovieCard
        v-for="movie in movies"
        :key="movie.id"
        :movie="movie"
        class="movie-card-item opacity-0"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-3">
        <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
    </div>

    <!-- Load More Button -->
    <div v-else-if="hasMore && !autoLoad" class="flex justify-center py-8">
      <UButton 
        @click="$emit('load-more')"
        size="lg"
        :loading="isLoadingMore"
      >
        Charger plus
      </UButton>
    </div>

    <!-- Infinite Scroll Trigger -->
    <div 
      v-if="hasMore && autoLoad && movies.length > 0 && !isLoading" 
      ref="observerTarget" 
      class="h-32 flex items-center justify-center my-8"
    >
      <Icon name="ph:arrow-down" class="w-8 h-8 text-primary-500 animate-bounce" />
    </div>

    <!-- No Results -->
    <div v-if="!isLoading && movies.length === 0" class="text-center py-12">
      <Icon name="ph:film-strip" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <p class="text-gray-600 dark:text-gray-400 text-lg">Aucun film trouvé</p>
    </div>

    <!-- End Message -->
    <div v-if="!hasMore && movies.length > 0" class="text-center py-8">
      <p class="text-gray-500 dark:text-gray-400">Vous avez vu tous les films disponibles</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import type { Movie } from '@/utils/types'

const props = withDefaults(defineProps<{
  movies: Movie[]
  isLoading?: boolean
  isLoadingMore?: boolean
  hasMore?: boolean
  autoLoad?: boolean
  pagination?: { total: number }
}>(), {
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  autoLoad: true,
  pagination: () => ({ total: 0 })
})

const emit = defineEmits(['load-more'])

const gridRef = ref<HTMLElement | null>(null)
const observerTarget = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// Setup observer function
const setupObserver = () => {
  if (!props.autoLoad || !observerTarget.value) {
    return
  }

  // Cleanup existing observer
  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      
      if (entry.isIntersecting && props.hasMore && !props.isLoadingMore) {
        emit('load-more')
      }
    },
    {
      threshold: 0,
      rootMargin: '0px'
    }
  )

  observer.observe(observerTarget.value)
}

// GSAP stagger animation on mount
onMounted(() => {
  nextTick(() => {
    // GSAP Animation
    if (gridRef.value) {
      const cards = gridRef.value.querySelectorAll('.movie-card-item')
      
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 30,
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out'
          }
        )
      }
    }
  })
})

// Watch for observerTarget to appear in DOM
watch(observerTarget, (newTarget) => {
  if (newTarget && props.autoLoad && props.hasMore) {
    nextTick(() => {
      setupObserver()
    })
  }
})

// Animate new items when movies array changes
watch(() => props.movies.length, (newLength, oldLength) => {
  if (newLength > oldLength && gridRef.value) {
    nextTick(() => {
      const cards = gridRef.value!.querySelectorAll('.movie-card-item')
      const newCards = Array.from(cards).slice(oldLength)
      
      if (newCards.length > 0) {
        gsap.fromTo(
          newCards,
          {
            opacity: 0,
            y: 30,
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out'
          }
        )
      }
    })
  }
})

// Watch hasMore and autoLoad to manage observer
watch(() => [props.hasMore, props.autoLoad] as const, ([newHasMore, newAutoLoad]) => {
  if (!newHasMore && observer) {
    observer.disconnect()
    observer = null
  } else if (newHasMore && newAutoLoad && observerTarget.value) {
    nextTick(() => {
      setupObserver()
    })
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>
