<template>
  <div class="space-y-6">
    <!-- Header with count and sort -->
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">
        Avis
        <span v-if="total > 0" class="text-gray-500 dark:text-gray-400 font-normal text-base">
          ({{ total }})
        </span>
      </h3>

      <select
        v-if="reviews.length > 0"
        v-model="sortBy"
        @change="handleSortChange"
        class="cursor-pointer px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="recent">Plus récents</option>
        <option value="rating_high">Note décroissante</option>
        <option value="rating_low">Note croissante</option>
      </select>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="animate-pulse">
        <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="reviews.length === 0" class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <Icon name="ph:chat-circle-dots" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <p class="text-gray-600 dark:text-gray-400">
        Aucun avis pour le moment. Soyez le premier à donner votre avis !
      </p>
    </div>

    <!-- Reviews list -->
    <div v-else class="space-y-4">
      <ReviewCard
        v-for="review in reviews"
        :key="review.id"
        :review="review"
        :current-user-id="currentUserId"
        @edit="handleEdit(review)"
        @delete="handleDelete(review)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-4">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <Icon name="heroicons:chevron-left" class="w-5 h-5" />
      </button>

      <span class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
        Page {{ currentPage }} sur {{ totalPages }}
      </span>

      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <Icon name="heroicons:chevron-right" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  reviews: any[]
  total: number
  currentPage: number
  totalPages: number
  isLoading: boolean
  currentUserId?: number
}>()

const emit = defineEmits(['page-change', 'sort-change', 'edit', 'delete'])

const sortBy = ref('recent')

const changePage = (page: number) => {
  emit('page-change', page)
}

const handleSortChange = () => {
  emit('sort-change', sortBy.value)
}

const handleEdit = (review: any) => {
  emit('edit', review)
}

const handleDelete = (review: any) => {
  emit('delete', review)
}
</script>
