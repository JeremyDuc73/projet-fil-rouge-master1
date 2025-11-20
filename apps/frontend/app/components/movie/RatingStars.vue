<template>
  <div class="flex flex-col gap-2">
    <!-- Stars Display/Input -->
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-1">
        <button
          v-for="star in 5"
          :key="star"
          @click="handleRate(star)"
          @mouseenter="hoverRating = star"
          @mouseleave="hoverRating = 0"
          :disabled="!interactive || isLoading"
          :class="[
            'transition-all duration-200',
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
            isLoading ? 'opacity-50' : ''
          ]"
          class="focus:outline-none"
        >
          <Icon
            :name="star <= displayRating ? 'ph:star-fill' : 'ph:star'"
            :class="[
              'w-6 h-6 transition-colors',
              star <= displayRating ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-600'
            ]"
          />
        </button>
      </div>
    </div>

    <!-- Info Text -->
    <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
      <!-- Average and count -->
      <div v-if="ratingsCount > 0" class="flex items-center gap-2">
        <span class="font-semibold text-gray-900 dark:text-white">{{ parseFloat(averageRating || 0).toFixed(1) }}/5</span>
        <span>·</span>
        <span>{{ ratingsCount }} avis</span>
      </div>
      
      <!-- User action hint -->
      <div v-if="interactive && !userRating" class="text-xs text-green-600 dark:text-green-400">
        Cliquez sur les étoiles pour noter (avec ou sans avis)
      </div>
      <div v-if="interactive && userRating" class="text-xs text-green-600 dark:text-green-400 font-medium">
        ✓ Vous avez noté : {{ userRating }}/5
      </div>
      
      <!-- No ratings yet -->
      <div v-if="ratingsCount === 0" class="text-xs">
        Aucun avis pour le moment. Soyez le premier à noter !
      </div>
    </div>

    <!-- Remove Rating Button -->
    <button
      v-if="interactive && userRating && !isLoading"
      @click="handleRemove"
      class="text-xs text-red-600 dark:text-red-400 hover:underline self-start cursor-pointer"
    >
      Retirer ma note
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  movieId: number
  userRating?: number | null
  averageRating?: number
  ratingsCount?: number
  interactive?: boolean
}>()

const emit = defineEmits<{
  (e: 'rate', rating: number): void
  (e: 'remove'): void
}>()

const hoverRating = ref(0)
const isLoading = ref(false)

const displayRating = computed(() => {
  // If hovering, show preview
  if (props.interactive && hoverRating.value > 0) {
    return hoverRating.value
  }
  // If user has rated, show their rating
  if (props.userRating) {
    return props.userRating
  }
  // Otherwise, show nothing (empty stars)
  return 0
})

const handleRate = (rating: number) => {
  if (!props.interactive || isLoading.value) return
  
  isLoading.value = true
  emit('rate', rating)
  
  // Reset loading after a short delay
  setTimeout(() => {
    isLoading.value = false
  }, 500)
}

const handleRemove = () => {
  if (isLoading.value) return
  
  isLoading.value = true
  emit('remove')
  
  setTimeout(() => {
    isLoading.value = false
  }, 500)
}
</script>
