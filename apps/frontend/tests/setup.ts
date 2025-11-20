import { config } from '@vue/test-utils'

// Configuration globale pour les tests Vue
config.global.stubs = {
  NuxtLink: true,
  Icon: true,
  ClientOnly: true
}
