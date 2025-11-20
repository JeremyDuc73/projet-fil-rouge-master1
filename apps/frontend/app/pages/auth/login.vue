<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      Connexion
    </h2>

    <form @submit="onSubmit" class="space-y-4">
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
      </div>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="isLoading"
      >
        Se connecter
      </UButton>
    </form>

    <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
      Pas encore de compte ?
      <NuxtLink to="/auth/register" class="text-blue-500 hover:text-blue-600 font-medium">
        Créer un compte
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema } from '@/utils/validation'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useHead({
  title: 'Connexion',
})

const router = useRouter()
const { login } = useAuth()

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(loginSchema),
})

const [email] = defineField('email')
const [password] = defineField('password')
const isLoading = ref(false)
const toast = useToast()

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true
  
  try {
    await login(values)
    toast.add({
      title: 'Connexion réussie',
      color: 'green',
      icon: 'ph:check-circle'
    })
    router.push('/')
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error.message || 'Erreur lors de la connexion',
      color: 'red',
      icon: 'ph:x-circle'
    })
  } finally {
    isLoading.value = false
  }
})
</script>
