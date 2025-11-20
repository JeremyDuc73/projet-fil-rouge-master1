<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Release Date -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Date de sortie
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ formatReleaseDate(releaseDate) }}
      </p>
    </div>

    <!-- Duration -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Durée
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ formatDuration(duration) }}
      </p>
    </div>

    <!-- Stats (if provided) -->
    <div v-if="stats">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Statistiques
      </h3>
      <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
        <p v-if="stats.favorites_count">
          <Icon name="ph:heart-fill" class="inline w-4 h-4 text-red-500 mr-1" />
          {{ stats.favorites_count }} favoris
        </p>
        <p v-if="stats.watchlist_count">
          <Icon name="ph:bookmark-simple-fill" class="inline w-4 h-4 text-blue-500 mr-1" />
          {{ stats.watchlist_count }} en watchlist
        </p>
        <p v-if="stats.views_count">
          <Icon name="ph:eye-fill" class="inline w-4 h-4 text-green-500 mr-1" />
          {{ stats.views_count }} vues
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  releaseDate?: string
  duration?: number
  stats?: {
    favorites_count?: number
    watchlist_count?: number
    views_count?: number
    ratings_count?: number
  }
}>()

const formatReleaseDate = (date?: string) => {
  if (!date) return 'Non disponible'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDuration = (minutes?: number) => {
  if (!minutes) return 'Non disponible'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
}
</script>
