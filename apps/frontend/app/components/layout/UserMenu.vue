<template>
  <div class="relative" ref="menuRef">
    <button 
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
    >
      <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
        {{ userInitials }}
      </div>
      <div class="hidden lg:block text-left">
        <div class="text-sm font-medium text-gray-900 dark:text-white">{{ fullName }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">{{ user?.email }}</div>
      </div>
      <Icon name="ph:caret-down" class="w-4 h-4 text-gray-500" />
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div 
        v-if="isOpen"
        class="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 z-50"
      >
        <!-- Profile -->
        <div class="p-1">
          <NuxtLink
            to="/profile"
            @click="closeMenu"
            class="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Icon name="ph:user" class="w-5 h-5" />
            Mon Profil
          </NuxtLink>
        </div>

        <!-- Collections -->
        <div class="p-1">
          <NuxtLink
            to="/profile/favorites"
            @click="closeMenu"
            class="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Icon name="ph:heart" class="w-5 h-5" />
            Mes Favoris
          </NuxtLink>
          <NuxtLink
            to="/profile/watchlist"
            @click="closeMenu"
            class="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Icon name="ph:bookmark" class="w-5 h-5" />
            Ma Watchlist
          </NuxtLink>
          <NuxtLink
            to="/profile/ratings"
            @click="closeMenu"
            class="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Icon name="ph:star" class="w-5 h-5" />
            Mes Notes
          </NuxtLink>
          <NuxtLink
            to="/profile/history"
            @click="closeMenu"
            class="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Icon name="ph:clock-counter-clockwise" class="w-5 h-5" />
            Historique
          </NuxtLink>
        </div>

        <!-- Admin -->
        <div v-if="isAdmin" class="p-1">
          <NuxtLink
            to="/admin/dashboard"
            @click="closeMenu"
            class="flex items-center gap-3 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
          >
            <Icon name="ph:shield-check" class="w-5 h-5" />
            Administration
          </NuxtLink>
        </div>

        <!-- Logout -->
        <div class="p-1">
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer"
          >
            <Icon name="ph:sign-out" class="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { user, fullName, isAdmin, logout } = useAuth()

const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const userInitials = computed(() => {
  if (!user.value) return '?'
  const first = user.value.firstname?.[0] || ''
  const last = user.value.lastname?.[0] || ''
  return (first + last).toUpperCase()
})

const closeMenu = () => {
  isOpen.value = false
}

const toast = useToast()

const handleLogout = async () => {
  closeMenu()
  await logout()
  toast.add({
    title: 'Déconnexion réussie',
    color: 'blue',
    icon: 'ph:sign-out'
  })
}

// Close menu on click outside
if (process.client) {
  onMounted(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
        closeMenu()
      }
    }
    document.addEventListener('click', handleClickOutside)
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
  })
}
</script>
