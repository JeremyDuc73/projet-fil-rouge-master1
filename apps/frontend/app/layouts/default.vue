<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
    <LayoutNavbar />
    
    <main class="flex-1">
      <slot />
    </main>
    
    <LayoutFooter />
  </div>
</template>

<script setup lang="ts">
// Main layout with Navbar and Footer
</script>
