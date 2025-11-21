<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Ajouter un film
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        Remplissez le formulaire pour ajouter un nouveau film
      </p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Titre *
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Titre du film"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            v-model="form.description"
            required
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Description du film"
          ></textarea>
        </div>

        <!-- Release Date & Duration -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date de sortie *
            </label>
            <input
              v-model="form.release_date"
              type="date"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Durée (minutes) *
            </label>
            <input
              v-model.number="form.duration_minutes"
              type="number"
              required
              min="1"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="120"
            />
          </div>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Catégorie *
          </label>
          <select
            v-model="form.category_id"
            required
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Sélectionner une catégorie</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Poster Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Affiche du film
          </label>
          <input
            type="file"
            accept="image/*"
            @change="handlePosterUpload"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-800"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Formats acceptés : JPG, PNG, WebP (max 5MB)
          </p>
          <div v-if="posterPreview" class="mt-3">
            <img :src="posterPreview" alt="Aperçu" class="w-32 h-48 object-cover rounded" />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4 pt-4">
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Création...' : 'Créer le film' }}
          </button>
          <NuxtLink
            to="/admin/movies"
            class="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            Annuler
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

useHead({
  title: 'Ajouter un film - Admin'
})

const api = useApi()
const toast = useToast()
const router = useRouter()

const loading = ref(false)
const categories = ref<any[]>([])

const form = reactive({
  title: '',
  description: '',
  release_date: '',
  duration_minutes: 0,
  category_id: '',
  poster_url: ''
})

const posterFile = ref<File | null>(null)
const posterPreview = ref<string | null>(null)

const handlePosterUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.add({
        title: 'Erreur',
        description: 'Le fichier est trop volumineux (max 5MB)',
        color: 'red',
        icon: 'ph:x-circle'
      })
      return
    }
    
    posterFile.value = file
    posterPreview.value = URL.createObjectURL(file)
  }
}

// Load categories
onMounted(async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de charger les catégories',
      color: 'red',
      icon: 'ph:x-circle'
    })
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    // 1. Créer le film
    const payload = {
      title: form.title,
      description: form.description,
      release_date: form.release_date,
      duration: form.duration_minutes,
      categoryIds: form.category_id ? [parseInt(form.category_id as any)] : []
    }
    
    const response = await api.post('/movies', payload)
    const movieId = response.data.id
    
    // 2. Upload du poster si présent
    if (posterFile.value) {
      const formData = new FormData()
      formData.append('poster', posterFile.value)

      await api.post(`/movies/${movieId}/poster`, formData)
    }
    
    toast.add({
      title: 'Succès',
      description: 'Film créé avec succès',
      color: 'green',
      icon: 'ph:check-circle'
    })
    
    router.push('/admin/movies')
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error?.data?.error || 'Impossible de créer le film',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    loading.value = false
  }
}
</script>
