<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      Inscription
    </h2>

    <form @submit="onSubmit" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prénom
          </label>
          <input
            v-model="firstname"
            type="text"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John"
          />
          <span v-if="errors.firstname" class="text-sm text-red-500 mt-1">{{ errors.firstname }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nom
          </label>
          <input
            v-model="lastname"
            type="text"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Doe"
          />
          <span v-if="errors.lastname" class="text-sm text-red-500 mt-1">{{ errors.lastname }}</span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          v-model="email"
          type="email"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="votre@email.com"
        />
        <span v-if="errors.email" class="text-sm text-red-500 mt-1">{{ errors.email }}</span>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mot de passe
        </label>
        <input
          v-model="password"
          type="password"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="••••••••"
        />
        <span v-if="errors.password" class="text-sm text-red-500 mt-1">{{ errors.password }}</span>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Minimum 8 caractères, 1 majuscule et 1 chiffre
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Confirmer le mot de passe
        </label>
        <input
          v-model="confirmPassword"
          type="password"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="••••••••"
        />
        <span v-if="errors.confirmPassword" class="text-sm text-red-500 mt-1">{{ errors.confirmPassword }}</span>
      </div>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="isLoading"
      >
        Créer mon compte
      </UButton>
    </form>

    <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
      Déjà un compte ?
      <NuxtLink to="/auth/login" class="text-blue-500 hover:text-blue-600 font-medium">
        Se connecter
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { registerSchema } from '@/utils/validation'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useHead({
  title: 'Inscription',
})

const router = useRouter()
const { register } = useAuth()

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(registerSchema),
})

const [email] = defineField('email')
const [password] = defineField('password')
const [confirmPassword] = defineField('confirmPassword')
const [firstname] = defineField('firstname')
const [lastname] = defineField('lastname')
const isLoading = ref(false)
const toast = useToast()

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true
  
  try {
    await register(values)
    toast.add({
      title: 'Inscription réussie',
      color: 'green',
      icon: 'ph:check-circle'
    })
    router.push('/')
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error.message || 'Erreur lors de l\'inscription',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isLoading.value = false
  }
})
</script>
