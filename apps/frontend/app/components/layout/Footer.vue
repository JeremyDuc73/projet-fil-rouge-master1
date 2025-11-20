<template>
  <footer class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-auto">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <Icon name="ph:film-strip-duotone" class="w-8 h-8 text-primary-500" />
            <span class="text-xl font-bold text-gray-900 dark:text-white">CineZone</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Votre plateforme de gestion et découverte de films préférés.
          </p>
          <div class="flex gap-3">
            <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
              <Icon name="ph:twitter-logo" class="w-5 h-5" />
            </a>
            <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
              <Icon name="ph:facebook-logo" class="w-5 h-5" />
            </a>
            <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
              <Icon name="ph:instagram-logo" class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Navigation -->
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Navigation</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                Accueil
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/movies" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                Films
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/profile" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                Mon Profil
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Ressources -->
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Ressources</h3>
          <ul class="space-y-2">
            <li>
              <a href="#" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                À propos
              </a>
            </li>
            <li>
              <a href="#" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                Contact
              </a>
            </li>
            <li>
              <a href="#" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                Blog
              </a>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Légal</h3>
          <ul class="space-y-2">
            <li>
              <a href="#" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                Mentions légales
              </a>
            </li>
            <li>
              <a href="#" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                Confidentialité
              </a>
            </li>
            <li>
              <a href="#" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                Conditions d'utilisation
              </a>
            </li>
            <li>
              <a href="#" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                Cookies
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            © {{ currentYear }} CineZone. Tous droits réservés.
          </p>
          <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Développé avec ❤️ par l'équipe CineZone</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
