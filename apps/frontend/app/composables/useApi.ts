import { ApiClient } from '@/utils/api'

export const useApi = () => {
  const config = useRuntimeConfig()
  return new ApiClient(config.public.apiBase as string)
}
