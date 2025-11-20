<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">
          🎬 CineZone
        </h1>
        <p class="text-gray-400">
          Votre catalogue de films
        </p>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
