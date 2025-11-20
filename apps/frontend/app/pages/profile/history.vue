<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Historique de visionnage
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Films que vous avez consultés récemment
        </p>
      </div>

      <!-- Clear History Button -->
      <UButton
        v-if="history.length > 0"
        color="red"
        variant="outline"
        @click="openClearModal"
        icon="ph:trash"
      >
        Effacer l'historique
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Chargement de l'historique...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="history.length === 0" class="text-center py-20">
      <Icon name="ph:clock-countdown" class="w-20 h-20 text-gray-400 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Aucun historique
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Commencez à explorer des films pour voir votre historique ici
      </p>
      <UButton to="/movies" color="primary" size="lg">
        Découvrir des films
      </UButton>
    </div>

    <!-- History List -->
    <div v-else class="space-y-4">
      <div
        v-for="item in history"
        :key="item.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer"
        @click="navigateToMovie(item.id)"
      >
        <div class="flex gap-4 p-4">
          <!-- Poster -->
          <div class="flex-shrink-0 w-24 h-36 rounded-lg overflow-hidden">
            <img
              v-if="item.poster_url"
              :src="getPosterUrl(item.poster_url)"
              :alt="item.title"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-white font-bold text-center p-2 text-sm"
              :style="{ backgroundColor: getColorFromTitle(item.title) }"
            >
              {{ item.title }}
            </div>
          </div>

          <!-- Info -->
          <div class="flex-grow min-w-0">
            <div class="flex items-start justify-between gap-4 mb-2">
              <div class="flex-grow min-w-0">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                  {{ item.title }}
                </h3>
                <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span v-if="item.release_date">
                    {{ new Date(item.release_date).getFullYear() }}
                  </span>
                  <span v-if="item.duration">
                    {{ formatDuration(item.duration) }}
                  </span>
                </div>
              </div>

              <!-- Ratings -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <!-- TMDB Rating -->
                <div 
                  v-if="item.tmdb_rating && parseFloat(item.tmdb_rating) > 0"
                  class="flex items-center gap-1 bg-yellow-500 text-black px-2 py-1 rounded-md text-xs font-bold"
                >
                  <Icon name="ph:star-fill" class="w-3 h-3" />
                  {{ parseFloat(item.tmdb_rating).toFixed(1) }}
                </div>
                
                <!-- Community Rating -->
                <div 
                  v-if="item.community_count && item.community_count > 0"
                  class="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold"
                >
                  <Icon name="ph:users-three" class="w-3 h-3" />
                  {{ parseFloat(item.community_rating || 0).toFixed(1) }}
                </div>
              </div>
            </div>

            <!-- Description -->
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {{ item.description }}
            </p>

            <!-- Categories & View Info -->
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex gap-2 flex-wrap">
                <span
                  v-for="category in item.categories?.slice(0, 3)"
                  :key="category.id"
                  class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs"
                >
                  {{ category.name }}
                </span>
              </div>

              <!-- Last viewed -->
              <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Icon name="ph:clock" class="w-4 h-4" />
                <span>{{ formatViewedAt(item.viewed_at) }}</span>
                <span v-if="item.view_count > 1" class="text-primary-500 font-semibold">
                  • {{ item.view_count }}x
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Clear History Confirmation Modal -->
  <ClientOnly>
    <SimpleModal
      v-if="showClearModal"
      @close="showClearModal = false"
    >
      <div class="p-6">
        <div class="flex items-start gap-4 mb-4">
          <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <Icon name="ph:trash" class="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Effacer l'historique
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Êtes-vous sûr de vouloir effacer tout votre historique de visionnage ? Cette action est irréversible.
            </p>
          </div>
        </div>
        
        <div class="flex gap-3 justify-end">
          <button
            @click="showClearModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            @click="handleClearHistory"
            :disabled="isClearing"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ isClearing ? 'Suppression...' : 'Effacer' }}
          </button>
        </div>
      </div>
    </SimpleModal>
  </ClientOnly>
</template>

<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

definePageMeta({
  middleware: 'auth'
})

const historyStore = useHistoryStore()
const router = useRouter()
const toast = useToast()

const history = ref<any[]>([])
const isLoading = ref(true)
const isClearing = ref(false)
const showClearModal = ref(false)

// Load history on mount
onMounted(async () => {
  try {
    history.value = await historyStore.fetchHistory({ limit: 50 })
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de charger l\'historique',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
})

const navigateToMovie = (movieId: number) => {
  router.push(`/movies/${movieId}`)
}

const openClearModal = () => {
  showClearModal.value = true
}

const handleClearHistory = async () => {
  isClearing.value = true
  try {
    await historyStore.clearHistory()
    history.value = []
    showClearModal.value = false
    
    toast.add({
      title: 'Historique effacé',
      description: 'Votre historique de visionnage a été effacé',
      color: 'green',
      icon: 'ph:check-circle'
    })
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible d\'effacer l\'historique',
      color: 'red'
    })
  } finally {
    isClearing.value = false
  }
}

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

const formatViewedAt = (date: string) => {
  return formatDistanceToNow(new Date(date), { 
    addSuffix: true,
    locale: fr 
  })
}

useHead({
  title: 'Historique de visionnage'
})
</script>
