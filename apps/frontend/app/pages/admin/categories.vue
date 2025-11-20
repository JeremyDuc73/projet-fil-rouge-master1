<template>
  <div class="text-center py-12">
    <Icon name="ph:tag" class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      Gestion des catégories
    </h2>
    <p class="text-gray-600 dark:text-gray-400">
      Cette fonctionnalité sera disponible prochainement
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

useHead({
  title: 'Gestion des Catégories - Admin'
})
</script>
