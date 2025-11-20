<template>
  <div class="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
    <div class="container mx-auto px-4 py-4 space-y-2">
      <!-- User Info (if authenticated) -->
      <div v-if="isAuthenticated && user" class="pb-3 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
            {{ userInitials }}
          </div>
          <div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ fullName }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</div>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <NuxtLink
        to="/"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        @click="$emit('close')"
      >
        <Icon name="ph:house" class="w-5 h-5" />
        <span class="font-medium">Accueil</span>
      </NuxtLink>

      <NuxtLink
        to="/movies"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        @click="$emit('close')"
      >
        <Icon name="ph:film-strip" class="w-5 h-5" />
        <span class="font-medium">Films</span>
      </NuxtLink>

      <!-- Authenticated User Menu -->
      <template v-if="isAuthenticated">
        <div class="pt-2 border-t border-gray-200 dark:border-gray-800">
          <NuxtLink
            to="/profile"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="$emit('close')"
          >
            <Icon name="ph:user" class="w-5 h-5" />
            <span class="font-medium">Mon Profil</span>
          </NuxtLink>

          <NuxtLink
            to="/profile/favorites"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="$emit('close')"
          >
            <Icon name="ph:heart" class="w-5 h-5" />
            <span class="font-medium">Mes Favoris</span>
          </NuxtLink>

          <NuxtLink
            to="/profile/watchlist"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="$emit('close')"
          >
            <Icon name="ph:bookmark" class="w-5 h-5" />
            <span class="font-medium">Ma Watchlist</span>
          </NuxtLink>

          <NuxtLink
            to="/profile/ratings"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="$emit('close')"
          >
            <Icon name="ph:star" class="w-5 h-5" />
            <span class="font-medium">Mes Notes</span>
          </NuxtLink>

          <NuxtLink
            to="/profile/history"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="$emit('close')"
          >
            <Icon name="ph:clock-counter-clockwise" class="w-5 h-5" />
            <span class="font-medium">Historique</span>
          </NuxtLink>
        </div>

        <!-- Admin Section -->
        <div v-if="isAdmin" class="pt-2 border-t border-gray-200 dark:border-gray-800">
          <NuxtLink
            to="/admin/dashboard"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            @click="$emit('close')"
          >
            <Icon name="ph:shield-check" class="w-5 h-5" />
            <span class="font-medium">Administration</span>
          </NuxtLink>
        </div>

        <!-- Logout -->
        <div class="pt-2 border-t border-gray-200 dark:border-gray-800">
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Icon name="ph:sign-out" class="w-5 h-5" />
            <span class="font-medium">Déconnexion</span>
          </button>
        </div>
      </template>

      <!-- Guest Buttons -->
      <template v-else>
        <div class="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <UButton to="/auth/login" variant="ghost" color="gray" block size="lg">
            Connexion
          </UButton>
          <UButton to="/auth/register" color="primary" block size="lg">
            S'inscrire
          </UButton>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['close'])
const { user, isAuthenticated, isAdmin, fullName, logout } = useAuth()

const userInitials = computed(() => {
  if (!user.value) return '?'
  const first = user.value.firstname?.[0] || ''
  const last = user.value.lastname?.[0] || ''
  return (first + last).toUpperCase()
})

const toast = useToast()

const handleLogout = async () => {
  await logout()
  toast.add({
    title: 'Déconnexion réussie',
    color: 'blue',
    icon: 'ph:sign-out'
  })
  emit('close')
}
</script>
