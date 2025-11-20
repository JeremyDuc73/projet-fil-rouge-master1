export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side to avoid SSR hydration mismatch
  if (process.server) return
  
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})
