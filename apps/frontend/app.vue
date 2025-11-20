<template>
  <div class="min-h-screen">
    <NuxtLoadingIndicator />
    <NuxtPage />
    <Toaster
      position="top-right"
      :toast-options="{
        duration: 3000,
        classNames: {
          toast: 'glass border border-slate-200 dark:border-slate-700',
          title: 'text-sm font-medium',
          description: 'text-xs',
        },
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner'

// App metadata
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - CineZone` : 'CineZone - Votre catalogue de films'
  },
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
