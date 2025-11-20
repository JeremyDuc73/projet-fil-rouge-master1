<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestion des utilisateurs</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ total }} utilisateurs au total</p>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rechercher</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Email, nom, prénom..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            @input="debouncedSearch"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rôle</label>
          <select
            v-model="filters.role"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            @change="loadUsers"
          >
            <option value="">Tous les rôles</option>
            <option value="user">Utilisateur</option>
            <option value="premium">Premium</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trier par</label>
          <select
            v-model="filters.sort"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            @change="loadUsers"
          >
            <option value="created_at">Date d'inscription</option>
            <option value="email">Email</option>
            <option value="lastname">Nom</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div v-if="isLoading" class="p-12 text-center">
        <Icon name="svg-spinners:ring-resize" class="w-12 h-12 mx-auto text-primary-500" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>

      <div v-else>
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead class="bg-gray-50 dark:bg-gray-950">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Utilisateur
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rôle
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Inscription
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-950">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {{ user.firstname[0]}}{{ user.lastname[0] }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ user.firstname }} {{ user.lastname }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="getRoleBadgeClass(user.role)"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ new Date(user.created_at).toLocaleDateString('fr-FR') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="openEditModal(user)"
                  class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mr-4"
                  title="Modifier le rôle"
                >
                  <Icon name="ph:pencil-simple" class="w-5 h-5" />
                </button>
                <button
                  v-if="user.id !== currentUserId"
                  @click="confirmDelete(user)"
                  class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  title="Supprimer"
                >
                  <Icon name="ph:trash" class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="users.length === 0" class="p-12 text-center">
          <Icon name="ph:users" class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p class="text-gray-600 dark:text-gray-400">Aucun utilisateur trouvé</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Page {{ currentPage }} sur {{ totalPages }}
          </div>
          <div class="flex gap-2">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-950"
            >
              Précédent
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-950"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Role Modal -->
    <ClientOnly>
      <SimpleModal v-if="showEditModal" @close="showEditModal = false">
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Modifier le rôle de {{ editingUser?.firstname }} {{ editingUser?.lastname }}
          </h3>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rôle
            </label>
            <select
              v-model="newRole"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="user">Utilisateur</option>
              <option value="premium">Premium</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div class="flex gap-3">
            <button
              @click="showEditModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-950"
            >
              Annuler
            </button>
            <button
              @click="updateUserRole"
              :disabled="isUpdating"
              class="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {{ isUpdating ? 'Mise à jour...' : 'Modifier' }}
            </button>
          </div>
        </div>
      </SimpleModal>

      <SimpleModal v-if="showDeleteModal" @close="showDeleteModal = false">
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Supprimer l'utilisateur
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Êtes-vous sûr de vouloir supprimer <strong>{{ userToDelete?.firstname }} {{ userToDelete?.lastname }}</strong> ?
            Cette action est irréversible.
          </p>
          <div class="flex gap-3">
            <button
              @click="showDeleteModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-950"
            >
              Annuler
            </button>
            <button
              @click="deleteUser"
              :disabled="isDeleting"
              class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {{ isDeleting ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </SimpleModal>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

useHead({
  title: 'Gestion des Utilisateurs - Admin'
})

const { user: currentUser } = useAuth()
const currentUserId = computed(() => currentUser.value?.id)

const users = ref<any[]>([])
const isLoading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20

const filters = ref({
  search: '',
  role: '',
  sort: 'created_at'
})

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref<any>(null)
const userToDelete = ref<any>(null)
const newRole = ref('')
const isUpdating = ref(false)
const isDeleting = ref(false)

const totalPages = computed(() => Math.ceil(total.value / pageSize))

const toast = useToast()

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    user: 'Utilisateur',
    premium: 'Premium',
    admin: 'Admin',
    super_admin: 'Super Admin'
  }
  return labels[role] || role
}

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    user: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    premium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    admin: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    super_admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
  }
  return classes[role] || classes.user
}

const loadUsers = async () => {
  isLoading.value = true
  try {
    const api = useApi()
    const params: any = {
      page: currentPage.value,
      limit: pageSize,
      sortBy: filters.value.sort,
      order: 'desc'
    }

    if (filters.value.search) {
      params.search = filters.value.search
    }

    if (filters.value.role) {
      params.role = filters.value.role
    }

    const response = await api.get('/users', { params })
    users.value = response.data || []
    total.value = response.pagination?.total || 0
  } catch (error) {
    console.error('Failed to load users:', error)
    toast.add({
      title: 'Erreur',
      description: 'Impossible de charger les utilisateurs',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isLoading.value = false
  }
}

let searchTimeout: any
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadUsers()
  }, 300)
}

const goToPage = (page: number) => {
  currentPage.value = page
  loadUsers()
}

const openEditModal = (user: any) => {
  editingUser.value = user
  newRole.value = user.role
  showEditModal.value = true
}

const updateUserRole = async () => {
  if (!editingUser.value) return
  
  isUpdating.value = true
  try {
    const api = useApi()
    await api.patch(`/users/${editingUser.value.id}/role`, { role: newRole.value })
    
    toast.add({
      title: 'Rôle modifié',
      description: 'Le rôle a été mis à jour avec succès',
      color: 'green',
      icon: 'ph:check-circle'
    })
    
    showEditModal.value = false
    await loadUsers()
  } catch (error: any) {
    console.error('Failed to update role:', error)
    toast.add({
      title: 'Erreur',
      description: error?.data?.error || 'Impossible de modifier le rôle',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isUpdating.value = false
  }
}

const confirmDelete = (user: any) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  
  isDeleting.value = true
  try {
    const api = useApi()
    await api.delete(`/users/${userToDelete.value.id}`)
    
    toast.add({
      title: 'Utilisateur supprimé',
      description: 'L\'utilisateur a été supprimé avec succès',
      color: 'green',
      icon: 'ph:check-circle'
    })
    
    showDeleteModal.value = false
    await loadUsers()
  } catch (error: any) {
    console.error('Failed to delete user:', error)
    toast.add({
      title: 'Erreur',
      description: error?.data?.error || 'Impossible de supprimer l\'utilisateur',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>
