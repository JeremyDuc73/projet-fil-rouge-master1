<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

// Redirect to dashboard on client side only
if (process.client) {
  navigateTo('/admin/dashboard', { replace: true })
}
</script>

<template>
  <div></div>
</template>
