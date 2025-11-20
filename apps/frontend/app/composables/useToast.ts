// Simple wrapper around Nuxt UI toast
export const useAppToast = () => {
  const toast = useToast()

  return {
    success: (title: string, description?: string) => {
      toast.add({
        title,
        description,
        color: 'green',
        icon: 'i-ph-check-circle',
      })
    },

    error: (title: string, description?: string) => {
      toast.add({
        title,
        description,
        color: 'red',
        icon: 'i-ph-x-circle',
      })
    },

    info: (title: string, description?: string) => {
      toast.add({
        title,
        description,
        color: 'blue',
        icon: 'i-ph-info',
      })
    },

    warning: (title: string, description?: string) => {
      toast.add({
        title,
        description,
        color: 'yellow',
        icon: 'i-ph-warning',
      })
    },

    add: toast.add,
  }
}
