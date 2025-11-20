<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Notations</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- TMDB Rating Badge -->
      <div 
        v-if="tmdbRating && parseFloat(tmdbRating) > 0" 
        class="p-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800"
      >
        <div class="flex items-center gap-2 mb-2">
          <Icon name="ph:film-reel" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Note TMDB</h3>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
            {{ parseFloat(tmdbRating).toFixed(1) }}
          </span>
          <span class="text-lg text-gray-600 dark:text-gray-400">/10</span>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {{ tmdbVoteCount?.toLocaleString() || 0 }} votes
        </p>
      </div>

      <!-- Community Rating Badge -->
      <div 
        v-if="isMovieReleased && communityCount > 0" 
        class="p-6 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
      >
        <div class="flex items-center gap-2 mb-2">
          <Icon name="ph:users-three" class="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Note Communauté</h3>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-4xl font-bold text-green-600 dark:text-green-400">
            {{ parseFloat(communityRating).toFixed(1) }}
          </span>
          <span class="text-lg text-gray-600 dark:text-gray-400">/5</span>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {{ communityCount }} {{ communityCount > 1 ? 'avis' : 'avis' }}
        </p>
      </div>
    </div>

    <!-- Interactive Rating -->
    <slot name="interactive-rating" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tmdbRating?: number
  tmdbVoteCount?: number
  communityRating?: number
  communityCount?: number
  isMovieReleased: boolean
}>()
</script>
