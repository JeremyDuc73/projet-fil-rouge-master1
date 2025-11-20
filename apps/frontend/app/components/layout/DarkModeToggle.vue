<template>
  <button
    @click="toggleDarkMode"
    class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
    :aria-label="isDark ? 'Activer le mode clair' : 'Activer le mode sombre'"
  >
    <Icon
      :name="isDark ? 'ph:sun' : 'ph:moon'"
      class="w-5 h-5 transition-transform hover:scale-110"
    />
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

const toggleDarkMode = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>
