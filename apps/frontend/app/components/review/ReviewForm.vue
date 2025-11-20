<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ initialReview ? 'Modifier votre avis' : 'Donner votre avis' }}
    </h3>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Rating -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Note
        </label>
        <div class="flex items-center gap-1">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            @click="rating = star"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
            class="transition-all duration-200 hover:scale-110 focus:outline-none cursor-pointer"
          >
            <Icon
              :name="star <= displayRating ? 'ph:star-fill' : 'ph:star'"
              :class="star <= displayRating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'"
              class="w-8 h-8"
            />
          </button>
          <span v-if="rating" class="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {{ rating }}/5
          </span>
        </div>
        <p v-if="errors.rating" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errors.rating }}
        </p>
      </div>

      <!-- Review text -->
      <div>
        <label for="reviewText" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Votre avis <span class="text-gray-400 text-xs">(optionnel)</span>
        </label>
        <textarea
          id="reviewText"
          v-model="reviewText"
          rows="4"
          :maxlength="1000"
          placeholder="Partagez votre avis sur ce film... (optionnel - minimum 10 caractères si rempli)"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        ></textarea>
        <div class="flex items-center justify-between mt-1">
          <p v-if="errors.reviewText" class="text-sm text-red-600 dark:text-red-400">
            {{ errors.reviewText }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 ml-auto">
            {{ reviewText.length }}/1000
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 pt-2">
        <UButton
          type="submit"
          :loading="isSubmitting"
          :disabled="!rating"
          color="primary"
        >
          {{ initialReview ? 'Mettre à jour' : 'Publier' }}
        </UButton>
        <UButton
          v-if="initialReview"
          type="button"
          variant="outline"
          color="gray"
          @click="$emit('cancel')"
          :disabled="isSubmitting"
        >
          Annuler
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  initialReview?: {
    rating: number
    review_text: string
  } | null
}>()

const emit = defineEmits(['submit', 'cancel'])

const rating = ref(props.initialReview?.rating || 0)
const reviewText = ref(props.initialReview?.review_text || '')
const hoverRating = ref(0)
const isSubmitting = ref(false)
const errors = ref<{ rating?: string; reviewText?: string }>({})

const displayRating = computed(() => {
  return hoverRating.value || rating.value
})

// Watch for initialReview changes
watch(() => props.initialReview, (newVal) => {
  if (newVal) {
    rating.value = newVal.rating
    reviewText.value = newVal.review_text || ''
  }
}, { immediate: true })

const validate = () => {
  errors.value = {}
  let isValid = true

  if (!rating.value || rating.value < 1 || rating.value > 5) {
    errors.value.rating = 'Veuillez donner une note entre 1 et 5'
    isValid = false
  }

  // Only validate review text if it's provided
  if (reviewText.value.trim()) {
    if (reviewText.value.trim().length < 10) {
      errors.value.reviewText = 'Votre avis doit contenir au moins 10 caractères'
      isValid = false
    } else if (reviewText.value.length > 1000) {
      errors.value.reviewText = 'Votre avis ne doit pas dépasser 1000 caractères'
      isValid = false
    }
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true

  try {
    await emit('submit', {
      rating: rating.value,
      reviewText: reviewText.value.trim()
    })

    // Reset form if not editing
    if (!props.initialReview) {
      rating.value = 0
      reviewText.value = ''
    }
  } catch (error) {
    console.error('Error submitting review:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
