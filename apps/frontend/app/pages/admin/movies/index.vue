<template>
  <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Gestion des films
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ total }} film{{ total > 1 ? 's' : '' }} au total
          </p>
        </div>
        
        <div class="flex gap-3">
          <button
            v-if="activeTab === 'tmdb'"
            @click="showSearchModal = true"
            class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Icon name="ph:magnifying-glass" class="w-5 h-5" />
            Rechercher et ajouter
          </button>
          <button
            v-if="activeTab === 'tmdb'"
            @click="importTMDBMovies"
            :disabled="isImporting"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Icon name="ph:download" class="w-5 h-5" />
            {{ isImporting ? 'Import en cours...' : 'Importer films TMDB' }}
          </button>
          <NuxtLink
            v-if="activeTab === 'custom'"
            to="/admin/movies/create"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Icon name="ph:plus" class="w-5 h-5" />
            Ajouter un film
          </NuxtLink>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav class="flex gap-8">
          <button
            @click="activeTab = 'custom'"
            :class="[
              'pb-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer',
              activeTab === 'custom'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
          >
            Films Custom
          </button>
          <button
            @click="activeTab = 'tmdb'"
            :class="[
              'pb-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer',
              activeTab === 'tmdb'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
          >
            Films TMDB
          </button>
        </nav>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rechercher
            </label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Titre du film..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              @input="debouncedSearch"
            />
          </div>

          <!-- Category Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catégorie
            </label>
            <select
              v-model="filters.category"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              @change="loadMovies"
            >
              <option value="">Toutes les catégories</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Sort -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trier par
            </label>
            <select
              v-model="filters.sort"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              @change="loadMovies"
            >
              <option value="created_at">Plus récents</option>
              <option value="title">Titre (A-Z)</option>
              <option value="release_year">Année de sortie</option>
              <option value="community_rating">Note</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Movies Table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div v-if="isLoading" class="p-6">
          <div v-for="i in 5" :key="i" class="animate-pulse flex gap-4 mb-4">
            <div class="w-16 h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>

        <table v-else class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Film
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Année
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Note
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Catégories
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="movie in movies"
              :key="movie.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <img
                    v-if="movie.poster_url"
                    :src="getImageUrl(movie.poster_url)"
                    :alt="movie.title"
                    class="w-12 h-18 object-cover rounded"
                  />
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">
                      {{ movie.title }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ movie.duration }} min
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {{ movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A' }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-1">
                  <Icon name="ph:star-fill" class="w-4 h-4 text-yellow-500" />
                  <span class="text-sm text-gray-900 dark:text-white">
                    {{ getRating(movie) }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    ({{ getRatingCount(movie) }})
                  </span>
                  <span v-if="movie.tmdb_id" class="text-xs text-blue-500 dark:text-blue-400" title="Note TMDB">
                    TMDB
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="cat in getCategories(movie).slice(0, 2)"
                    :key="cat.id || cat"
                    class="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded"
                  >
                    {{ cat.name || cat }}
                  </span>
                  <span
                    v-if="getCategories(movie).length > 2"
                    class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                  >
                    +{{ getCategories(movie).length - 2 }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/movies/${movie.id}`"
                    class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    target="_blank"
                    title="Voir le film"
                  >
                    <Icon name="ph:eye" class="w-5 h-5" />
                  </NuxtLink>
                  <!-- Édition seulement pour les films custom -->
                  <NuxtLink
                    v-if="!movie.tmdb_id"
                    :to="`/admin/movies/${movie.id}/edit`"
                    class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    title="Modifier"
                  >
                    <Icon name="ph:pencil-simple" class="w-5 h-5" />
                  </NuxtLink>
                  <button
                    @click="confirmDelete(movie)"
                    class="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                    title="Supprimer"
                  >
                    <Icon name="ph:trash" class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!isLoading && movies.length === 0" class="p-12 text-center">
          <Icon name="ph:film-strip" class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p class="text-gray-500 dark:text-gray-400">Aucun film trouvé</p>
        </div>

        <!-- Pagination -->
        <div v-if="total > pageSize" class="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Affichage de {{ ((currentPage - 1) * pageSize) + 1 }} à {{ Math.min(currentPage * pageSize, total) }} sur {{ total }} films
            </div>
            <div class="flex gap-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                Précédent
              </button>
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>

    <!-- Delete Modal -->
    <ClientOnly>
      <SimpleModal v-if="showDeleteModal" @close="showDeleteModal = false">
        <div class="p-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Icon name="ph:warning" class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Supprimer le film
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Cette action est irréversible
              </p>
            </div>
          </div>

          <p class="text-gray-700 dark:text-gray-300 mb-6">
            Êtes-vous sûr de vouloir supprimer <strong>{{ movieToDelete?.title }}</strong> ?
          </p>

          <div class="flex gap-3 justify-end">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              Annuler
            </button>
            <button
              @click="deleteMovie"
              :disabled="isDeleting"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 cursor-pointer"
            >
              {{ isDeleting ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </SimpleModal>

      <!-- TMDB Search Modal -->
      <SimpleModal v-if="showSearchModal" @close="closeSearchModal">
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Rechercher un film sur TMDB
          </h3>
          
          <!-- Search Input -->
          <div class="mb-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un film..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              @keyup.enter="searchTMDB"
            />
          </div>
          
          <button
            @click="searchTMDB"
            :disabled="isSearching || !searchQuery"
            class="w-full mb-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 cursor-pointer"
          >
            {{ isSearching ? 'Recherche...' : 'Rechercher' }}
          </button>

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="max-h-96 overflow-y-auto space-y-3">
            <div
              v-for="movie in searchResults"
              :key="movie.id"
              class="flex gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <img
                v-if="movie.poster_path"
                :src="`https://image.tmdb.org/t/p/w92${movie.poster_path}`"
                :alt="movie.title"
                class="w-16 h-24 object-cover rounded"
              />
              <div v-else class="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                <Icon name="ph:film-slate" class="w-8 h-8 text-gray-400" />
              </div>
              
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 dark:text-white">{{ movie.title }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ movie.release_date?.substring(0, 4) || 'N/A' }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-500 line-clamp-2 mt-1">{{ movie.overview || 'Pas de description' }}</p>
              </div>

              <button
                @click="importMovie(movie.id)"
                :disabled="importingMovieId === movie.id"
                class="px-4 py-2 h-fit bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {{ importingMovieId === movie.id ? 'Import...' : 'Ajouter' }}
              </button>
            </div>
          </div>

          <div v-else-if="searchResults.length === 0 && hasSearched" class="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun résultat trouvé
          </div>
        </div>
      </SimpleModal>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

const toast = useToast()
const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const config = useRuntimeConfig()
  return `${config.public.apiUrl}${url}`
}
const isLoading = ref(true)
const isDeleting = ref(false)
const isImporting = ref(false)
const movies = ref<any[]>([])
const categories = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const totalPages = computed(() => Math.ceil(total.value / pageSize))

const activeTab = ref<'custom' | 'tmdb'>('custom')

const filters = ref({
  search: '',
  category: '',
  sort: 'created_at'
})

const showDeleteModal = ref(false)
const movieToDelete = ref<any>(null)

// TMDB Search Modal
const showSearchModal = ref(false)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)
const hasSearched = ref(false)
const importingMovieId = ref<number | null>(null)

// Fonctions utilitaires pour afficher les notes
const getRating = (movie: any) => {
  // Pour les films TMDB, afficher tmdb_rating
  if (movie.tmdb_id && movie.tmdb_rating != null) {
    const rating = parseFloat(movie.tmdb_rating)
    if (!isNaN(rating)) {
      return rating.toFixed(1)
    }
  }
  // Pour les films custom, afficher community_rating
  if (movie.community_rating != null) {
    const rating = parseFloat(movie.community_rating)
    if (!isNaN(rating)) {
      return rating.toFixed(1)
    }
  }
  return 'N/A'
}

const getRatingCount = (movie: any) => {
  // Pour les films TMDB, afficher tmdb_vote_count
  if (movie.tmdb_id && movie.tmdb_vote_count != null) {
    return movie.tmdb_vote_count
  }
  // Pour les films custom, afficher community_count
  return movie.community_count || 0
}

const getCategories = (movie: any) => {
  if (!movie.categories) return []
  
  // Si c'est déjà un array, le retourner
  if (Array.isArray(movie.categories)) {
    return movie.categories
  }
  
  // Si c'est une string JSON, la parser
  if (typeof movie.categories === 'string') {
    try {
      const parsed = JSON.parse(movie.categories)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  
  return []
}

const loadMovies = async () => {
  isLoading.value = true
  try {
    const api = useApi()
    const params: any = {
      page: currentPage.value,
      limit: pageSize,
      sortBy: filters.value.sort,
      order: 'desc',
      source: activeTab.value // 'custom' ou 'tmdb'
    }

    if (filters.value.search) {
      params.search = filters.value.search
    }

    if (filters.value.category) {
      params.category = filters.value.category
    }

    const response = await api.get('/movies', { params })
    movies.value = response.data || []
    total.value = response.pagination?.total || 0
  } catch (error) {
    console.error('Failed to load movies:', error)
    toast.add({
      title: 'Erreur',
      description: 'Impossible de charger les films',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isLoading.value = false
  }
}

const loadCategories = async () => {
  try {
    const api = useApi()
    const response = await api.get('/categories')
    categories.value = response.data || []
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1
  loadMovies()
}, 500)

const goToPage = (page: number) => {
  currentPage.value = page
  loadMovies()
}

const confirmDelete = (movie: any) => {
  movieToDelete.value = movie
  showDeleteModal.value = true
}

const deleteMovie = async () => {
  if (!movieToDelete.value) return
  
  isDeleting.value = true
  try {
    const api = useApi()
    await api.delete(`/movies/${movieToDelete.value.id}`)
    
    toast.add({
      title: 'Film supprimé',
      description: `${movieToDelete.value.title} a été supprimé avec succès`,
      color: 'green',
      icon: 'ph:check-circle'
    })
    
    showDeleteModal.value = false
    movieToDelete.value = null
    await loadMovies()
  } catch (error: any) {
    console.error('Failed to delete movie:', error)
    toast.add({
      title: 'Erreur',
      description: error?.data?.message || 'Impossible de supprimer le film',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isDeleting.value = false
  }
}

const importTMDBMovies = async () => {
  isImporting.value = true
  try {
    const api = useApi()
    const response = await api.post('/movies/import-tmdb')
    
    toast.add({
      title: 'Import réussi',
      description: `${response.imported || 0} films importés, ${response.skipped || 0} déjà existants`,
      color: 'green',
      icon: 'ph:check-circle'
    })
    
    await loadMovies()
  } catch (error: any) {
    console.error('Failed to import TMDB movies:', error)
    toast.add({
      title: 'Erreur',
      description: error?.data?.error || 'Impossible d\'importer les films TMDB',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isImporting.value = false
  }
}

const searchTMDB = async () => {
  if (!searchQuery.value.trim()) return
  
  isSearching.value = true
  hasSearched.value = false
  searchResults.value = []
  
  try {
    const api = useApi()
    const response = await api.get('/movies/tmdb/search', { params: { q: searchQuery.value } })
    searchResults.value = response.data?.results || []
    hasSearched.value = true
  } catch (error: any) {
    console.error('Failed to search TMDB:', error)
    toast.add({
      title: 'Erreur',
      description: 'Impossible de rechercher sur TMDB',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isSearching.value = false
  }
}

const importMovie = async (tmdbId: number) => {
  importingMovieId.value = tmdbId
  
  try {
    const api = useApi()
    await api.post(`/movies/tmdb/${tmdbId}`)
    
    toast.add({
      title: 'Succès',
      description: 'Film ajouté avec succès',
      color: 'green',
      icon: 'ph:check-circle'
    })
    
    closeSearchModal()
    await loadMovies()
  } catch (error: any) {
    console.error('Failed to import movie:', error)
    toast.add({
      title: 'Erreur',
      description: error?.data?.error || 'Impossible d\'ajouter le film',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    importingMovieId.value = null
  }
}

const closeSearchModal = () => {
  showSearchModal.value = false
  searchQuery.value = ''
  searchResults.value = []
  hasSearched.value = false
  importingMovieId.value = null
}

// Watch pour recharger quand l'onglet change
watch(activeTab, () => {
  currentPage.value = 1
  loadMovies()
})

onMounted(async () => {
  await Promise.all([
    loadMovies(),
    loadCategories()
  ])
})

useHead({
  title: 'Gestion des Films - Admin'
})
</script>
