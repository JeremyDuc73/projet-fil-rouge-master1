<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <div class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
          {{ initials }}
        </div>
        
        <!-- User info -->
        <div>
          <h4 class="font-semibold text-gray-900 dark:text-white">
            {{ review.firstname }} {{ review.lastname }}
          </h4>
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <time :datetime="review.created_at">
              {{ formatDate(review.created_at) }}
            </time>
            <span v-if="isEdited">· Modifié</span>
          </div>
        </div>
      </div>

      <!-- Rating stars -->
      <div class="flex items-center gap-1">
        <Icon
          v-for="star in 5"
          :key="star"
          :name="star <= review.rating ? 'ph:star-fill' : 'ph:star'"
          :class="star <= review.rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'"
          class="w-5 h-5"
        />
      </div>
    </div>

    <!-- Review text -->
    <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
      {{ review.review_text }}
    </p>

    <!-- Actions (if own review) -->
    <div v-if="isOwnReview" class="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        @click="$emit('edit')"
        class="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 cursor-pointer"
      >
        <Icon name="ph:pencil" class="w-4 h-4" />
        Modifier
      </button>
      <button
        @click="$emit('delete')"
        class="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
      >
        <Icon name="ph:trash" class="w-4 h-4" />
        Supprimer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

const props = defineProps<{
  review: {
    id: number
    user_id: number
    rating: number
    review_text: string
    firstname: string
    lastname: string
    created_at: string
    updated_at: string
  }
  currentUserId?: number
}>()

defineEmits(['edit', 'delete'])

const initials = computed(() => {
  const first = props.review.firstname?.charAt(0) || ''
  const last = props.review.lastname?.charAt(0) || ''
  return (first + last).toUpperCase()
})

const isOwnReview = computed(() => {
  return props.currentUserId && props.currentUserId === props.review.user_id
})

const isEdited = computed(() => {
  return props.review.created_at !== props.review.updated_at
})

const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'd MMMM yyyy', { locale: fr })
  } catch (error) {
    return dateString
  }
}
</script>
