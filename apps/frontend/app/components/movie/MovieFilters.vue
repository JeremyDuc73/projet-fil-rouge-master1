<template>
  <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4">
    <div class="container mx-auto px-4">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="localSearch"
              type="text"
              placeholder="Rechercher un film..."
              class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              @input="debouncedSearch"
            />
            <button
              v-if="localSearch"
              @click="clearSearch"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Icon name="ph:x" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Category Filter -->
        <div class="lg:w-64">
          <select
            v-model="localCategory"
            @change="handleCategoryChange"
            class="cursor-pointer w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            <option :value="null">Toutes les catégories</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.slug"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Rating Filter -->
        <div class="lg:w-48">
          <select
            v-model="localMinRating"
            @change="handleRatingChange"
            class="cursor-pointer w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            <option :value="null">Note minimum</option>
            <option :value="9">9+ ⭐</option>
            <option :value="8">8+ ⭐</option>
            <option :value="7">7+ ⭐</option>
            <option :value="6">6+ ⭐</option>
            <option :value="5">5+ ⭐</option>
          </select>
        </div>

        <!-- Sort -->
        <div class="lg:w-48">
          <select
            v-model="localSort"
            @change="handleSortChange"
            class="cursor-pointer w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            <option value="created_at:DESC">Plus récents</option>
            <option value="created_at:ASC">Plus anciens</option>
            <option value="title:ASC">Titre (A-Z)</option>
            <option value="title:DESC">Titre (Z-A)</option>
            <option value="tmdb_rating:DESC">Mieux notés</option>
            <option value="release_date:DESC">Date de sortie</option>
          </select>
        </div>

        <!-- Clear Filters -->
        <button
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="lg:w-auto px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="ph:x-circle" class="w-4 h-4" />
          <span class="hidden lg:inline">Réinitialiser</span>
        </button>
      </div>

      <!-- Active Filters Tags -->
      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mt-4">
        <span
          v-if="localSearch"
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm"
        >
          <Icon name="ph:magnifying-glass" class="w-3 h-3" />
          "{{ localSearch }}"
          <button @click="clearSearch" class="hover:text-primary-900 dark:hover:text-primary-200">
            <Icon name="ph:x" class="w-3 h-3" />
          </button>
        </span>

        <span
          v-if="localCategory"
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm"
        >
          {{ getCategoryName(localCategory) }}
          <button @click="clearCategory" class="hover:text-blue-900 dark:hover:text-blue-200">
            <Icon name="ph:x" class="w-3 h-3" />
          </button>
        </span>

        <span
          v-if="localMinRating"
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm"
        >
          <Icon name="ph:star-fill" class="w-3 h-3" />
          {{ localMinRating }}+
          <button @click="clearRating" class="hover:text-yellow-900 dark:hover:text-yellow-200">
            <Icon name="ph:x" class="w-3 h-3" />
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '@/utils/types'

const props = defineProps<{
  search: string
  category: string | null
  minRating: number | null
  sortBy: string
  order: 'ASC' | 'DESC'
  categories: Category[]
}>()

const emit = defineEmits(['update:search', 'update:category', 'update:minRating', 'update:sort', 'clear'])

const localSearch = ref(props.search)
const localCategory = ref(props.category)
const localMinRating = ref(props.minRating)
const localSort = ref(`${props.sortBy}:${props.order}`)

let searchTimeout: NodeJS.Timeout

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('update:search', localSearch.value)
  }, 500)
}

const handleCategoryChange = () => {
  emit('update:category', localCategory.value)
}

const handleRatingChange = () => {
  emit('update:minRating', localMinRating.value)
}

const handleSortChange = () => {
  const [sortBy, order] = localSort.value.split(':')
  emit('update:sort', { sortBy, order })
}

const clearSearch = () => {
  localSearch.value = ''
  emit('update:search', '')
}

const clearCategory = () => {
  localCategory.value = null
  emit('update:category', null)
}

const clearRating = () => {
  localMinRating.value = null
  emit('update:minRating', null)
}

const clearAllFilters = () => {
  localSearch.value = ''
  localCategory.value = null
  localMinRating.value = null
  localSort.value = 'created_at:DESC'
  emit('clear')
}

const hasActiveFilters = computed(() => {
  return localSearch.value || localCategory.value || localMinRating.value
})

const getCategoryName = (slug: string) => {
  return props.categories.find(c => c.slug === slug)?.name || slug
}

// Watch props changes
watch(() => props.search, (val) => { localSearch.value = val })
watch(() => props.category, (val) => { localCategory.value = val })
watch(() => props.minRating, (val) => { localMinRating.value = val })
watch(() => `${props.sortBy}:${props.order}`, (val) => { localSort.value = val })

onUnmounted(() => {
  clearTimeout(searchTimeout)
})
</script>
