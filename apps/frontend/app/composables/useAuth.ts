export const useAuth = () => {
  const authStore = useAuthStore()

  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isLoading: computed(() => authStore.isLoading),
    isAdmin: computed(() => authStore.isAdmin),
    fullName: computed(() => authStore.fullName),
    
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
    fetchUser: authStore.fetchUser,
  }
}
