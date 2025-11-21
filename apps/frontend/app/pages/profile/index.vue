<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Mon Profil
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Gérez vos informations personnelles et vos préférences
      </p>
    </div>

    <ClientOnly>
      <!-- User Info Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
      <div class="flex items-start gap-6">
        <!-- Avatar -->
        <div class="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
          {{ userInitials }}
        </div>

        <!-- Info -->
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {{ fullName }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">{{ user?.email }}</p>
          
          <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center gap-2">
              <Icon name="ph:calendar" class="w-4 h-4" />
              <span>Membre depuis {{ formatDate(user?.created_at) }}</span>
            </div>
            <div v-if="user?.role === 'admin'" class="flex items-center gap-2">
              <Icon name="ph:shield-check" class="w-4 h-4 text-primary-500" />
              <span class="text-primary-500 font-medium">Administrateur</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
        <Icon name="ph:heart-fill" class="w-8 h-8 text-red-500 mx-auto mb-2" />
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          <span v-if="!isLoadingStats">{{ stats.favorites }}</span>
          <div v-else class="animate-pulse h-8 bg-gray-300 dark:bg-gray-600 rounded w-12 mx-auto"></div>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Favoris</div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
        <Icon name="ph:eye" class="w-8 h-8 text-blue-500 mx-auto mb-2" />
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          <span v-if="!isLoadingStats">{{ watchlistStats.to_watch }}</span>
          <div v-else class="animate-pulse h-8 bg-gray-300 dark:bg-gray-600 rounded w-12 mx-auto"></div>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">À voir</div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
        <Icon name="ph:check-circle" class="w-8 h-8 text-green-500 mx-auto mb-2" />
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          <span v-if="!isLoadingStats">{{ watchlistStats.watched }}</span>
          <div v-else class="animate-pulse h-8 bg-gray-300 dark:bg-gray-600 rounded w-12 mx-auto"></div>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Vus</div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
        <Icon name="ph:x-circle" class="w-8 h-8 text-red-500 mx-auto mb-2" />
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          <span v-if="!isLoadingStats">{{ watchlistStats.dropped }}</span>
          <div v-else class="animate-pulse h-8 bg-gray-300 dark:bg-gray-600 rounded w-12 mx-auto"></div>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Abandonnés</div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
        <Icon name="ph:star-fill" class="w-8 h-8 text-yellow-500 mx-auto mb-2" />
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          <span v-if="!isLoadingStats">{{ stats.reviews }}</span>
          <div v-else class="animate-pulse h-8 bg-gray-300 dark:bg-gray-600 rounded w-12 mx-auto"></div>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Notes</div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
        <Icon name="ph:clock-counter-clockwise" class="w-8 h-8 text-purple-500 mx-auto mb-2" />
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          <span v-if="!isLoadingStats">{{ stats.history }}</span>
          <div v-else class="animate-pulse h-8 bg-gray-300 dark:bg-gray-600 rounded w-12 mx-auto"></div>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Historique</div>
      </div>
    </div>

    <!-- Edit Profile Section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Informations personnelles
      </h3>

      <form @submit.prevent="handleUpdateProfile" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prénom
            </label>
            <input
              v-model="profileForm.first_name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom
            </label>
            <input
              v-model="profileForm.last_name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            v-model="profileForm.email"
            type="email"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            disabled
            readonly
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            L'email ne peut pas être modifié
          </p>
        </div>

        <div class="flex justify-end">
          <UButton
            type="submit"
            color="primary"
            class="cursor-pointer"
            :loading="isUpdatingProfile"
            :disabled="!isProfileFormDirty"
          >
            Enregistrer les modifications
          </UButton>
        </div>
      </form>
    </div>

      <!-- Change Password Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Changer le mot de passe
      </h3>

      <form @submit.prevent="handleChangePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mot de passe actuel
          </label>
          <input
            v-model="passwordForm.current_password"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nouveau mot de passe
          </label>
          <input
            v-model="passwordForm.new_password"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
            minlength="6"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Minimum 6 caractères
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirmer le nouveau mot de passe
          </label>
          <input
            v-model="passwordForm.confirm_password"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
            minlength="6"
          />
        </div>

        <div v-if="passwordError" class="text-sm text-red-600 dark:text-red-400">
          {{ passwordError }}
        </div>

        <div class="flex justify-end">
          <UButton
            class="cursor-pointer"
            type="submit"
            color="primary"
            :loading="isChangingPassword"
          >
            Changer le mot de passe
          </UButton>
        </div>
      </form>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

definePageMeta({
  middleware: 'auth'
})

const toast = useToast()
const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()
const watchlistStore = useWatchlistStore()
const reviewsStore = useReviewsStore()
const historyStore = useHistoryStore()

const user = computed(() => authStore.user)

const userInitials = computed(() => {
  if (!user.value) return '?'
  const first = user.value.firstname?.[0] || ''
  const last = user.value.lastname?.[0] || ''
  return (first + last).toUpperCase() || user.value.email[0].toUpperCase()
})

const fullName = computed(() => {
  if (!user.value) return ''
  return `${user.value.firstname || ''} ${user.value.lastname || ''}`.trim() || user.value.email
})

// Statistics
const stats = ref({
  favorites: 0,
  watchlist: 0,
  reviews: 0,
  history: 0
})

const watchlistStats = computed(() => watchlistStore.stats)

const isLoadingStats = ref(true)

// Profile form
const profileForm = ref({
  first_name: '',
  last_name: '',
  email: ''
})

const isUpdatingProfile = ref(false)

const isProfileFormDirty = computed(() => {
  if (!user.value) return false
  return (
    profileForm.value.first_name !== (user.value.firstname || '') ||
    profileForm.value.last_name !== (user.value.lastname || '')
  )
})

// Password form
const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const isChangingPassword = ref(false)
const passwordError = ref('')

// Format date
const formatDate = (date: string | undefined) => {
  if (!date) return 'Date inconnue'
  return format(new Date(date), 'MMMM yyyy', { locale: fr })
}

// Load data on mount
onMounted(async () => {
  // Load user data into form
  if (user.value) {
    profileForm.value = {
      first_name: user.value.firstname || '',
      last_name: user.value.lastname || '',
      email: user.value.email
    }
  }

  // Load statistics
  try {
    await Promise.all([
      favoritesStore.fetchFavorites(),
      watchlistStore.fetchWatchlist(),
      watchlistStore.fetchStats(),
      reviewsStore.fetchMyReviews(),
      historyStore.fetchHistory({ limit: 1000 })
    ])

    stats.value = {
      favorites: favoritesStore.favorites.length,
      watchlist: watchlistStore.watchlist.length,
      reviews: reviewsStore.myReviews.length,
      history: historyStore.history.length
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  } finally {
    isLoadingStats.value = false
  }
})

// Update profile
const handleUpdateProfile = async () => {
  isUpdatingProfile.value = true
  try {
    const api = useApi()
    const response: any = await api.patch('/users/me', {
      firstname: profileForm.value.first_name,
      lastname: profileForm.value.last_name
    })
    
    // Update auth store
    authStore.user = response.data
    
    toast.add({
      title: 'Profil mis à jour',
      description: 'Vos informations ont été mises à jour avec succès',
      color: 'green',
      icon: 'ph:check-circle'
    })
  } catch (error: any) {
    console.error('Profile update error:', error)
    toast.add({
      title: 'Erreur',
      description: error?.data?.message || error?.message || 'Impossible de mettre à jour le profil',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isUpdatingProfile.value = false
  }
}

// Change password
const handleChangePassword = async () => {
  passwordError.value = ''
  
  // Validation
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    passwordError.value = 'Les mots de passe ne correspondent pas'
    return
  }

  if (passwordForm.value.new_password.length < 6) {
    passwordError.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }

  isChangingPassword.value = true
  try {
    const api = useApi()
    await api.patch('/users/me/password', {
      currentPassword: passwordForm.value.current_password,
      newPassword: passwordForm.value.new_password
    })
    
    // Reset form
    passwordForm.value = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
    
    toast.add({
      title: 'Mot de passe changé',
      description: 'Votre mot de passe a été changé avec succès',
      color: 'green',
      icon: 'ph:check-circle'
    })
  } catch (error: any) {
    console.error('Password change error:', error)
    const errorMessage = error?.data?.message || error?.message || 'Impossible de changer le mot de passe'
    passwordError.value = errorMessage
    toast.add({
      title: 'Erreur',
      description: errorMessage,
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isChangingPassword.value = false
  }
}

useHead({
  title: 'Mon Profil'
})
</script>
