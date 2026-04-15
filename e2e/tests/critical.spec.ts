import { expect, test, type Page } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

const E2E_USER = process.env.E2E_USER_EMAIL ?? 'e2e-user@cinezone.test'
const E2E_ADMIN = process.env.E2E_ADMIN_EMAIL ?? 'e2e-admin@cinezone.test'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'E2E_Test_Pass_1!'

async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/login')
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill(password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).toHaveURL(/\/($|\?)/, { timeout: 20_000 })
}

test.describe('Parcours critiques', () => {
  test('connexion utilisateur', async ({ page }) => {
    await login(page, E2E_USER, E2E_PASSWORD)
    // Plusieurs liens « Voir tout » sur l’accueil (par section) : cibler la section Films populaires
    await expect(
      page.locator('section').filter({ hasText: 'Films populaires' }).getByRole('link', { name: /Voir tout/i })
    ).toBeVisible({ timeout: 25_000 })
  })

  test('catalogue — recherche et filtres', async ({ page }) => {
    await login(page, E2E_USER, E2E_PASSWORD)
    await page.goto('/movies')

    await expect(page.getByRole('heading', { name: /Catalogue de Films/i })).toBeVisible()

    await page.getByTestId('catalog-search').fill('Alpha')
    // Ne pas compter toutes les cartes : la CI peut avoir d’autres films (TMDB) contenant « Alpha »
    await expect(page.getByTestId('movie-card').filter({ hasText: 'E2E Film Alpha' })).toHaveCount(1)

    await page.getByTestId('catalog-search').clear()
    await expect(page.getByTestId('movie-card').filter({ hasText: 'E2E Film Alpha' })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByTestId('movie-card').filter({ hasText: 'E2E Film Beta' })).toBeVisible({
      timeout: 10_000,
    })

    await page.getByTestId('catalog-category').selectOption({ label: 'Action' })
    await expect(page.getByTestId('movie-card').filter({ hasText: 'E2E Film Alpha' })).toBeVisible()

    await page.getByTestId('catalog-category').selectOption({ label: 'Toutes les catégories' })
    await page.getByTestId('catalog-min-rating').selectOption('7')
    await expect(page.getByTestId('movie-card').filter({ hasText: 'E2E Film Alpha' })).toBeVisible()
    await expect(page.getByTestId('movie-card').filter({ hasText: 'E2E Film Beta' })).toHaveCount(0)
  })

  test('favori — ajout depuis la grille', async ({ page }) => {
    await login(page, E2E_USER, E2E_PASSWORD)
    await page.goto('/movies')
    await page.getByTestId('catalog-search').fill('Alpha')
    const card = page.getByTestId('movie-card').filter({ hasText: 'E2E Film Alpha' }).first()
    await card.hover()
    const favBtn = card.getByTestId('movie-favorite-toggle')
    await expect(favBtn).toBeVisible({ timeout: 10_000 })
    // Retry CI : si le film est déjà en favoris, un clic envoie DELETE — on rétablit l’état puis on ajoute.
    const favoriClasses = await favBtn.getAttribute('class')
    if (favoriClasses?.includes('bg-red-500')) {
      await favBtn.click()
      await expect(favBtn).toHaveClass(/bg-gray-800/)
    }
    await favBtn.click()
    await expect(favBtn).toHaveClass(/bg-red-500/)
    await page.goto('/profile/favorites')
    await expect(page.locator('[data-movie-title="E2E Film Alpha"]')).toBeVisible()
  })

  test('admin — création de film custom', async ({ page }) => {
    await login(page, E2E_ADMIN, E2E_PASSWORD)
    await page.goto('/admin/movies/create')

    const title = `E2E Create ${Date.now()}`
    const description = 'Description créée par Playwright.'
    await page.getByTestId('admin-movie-title').fill(title)
    await page.getByTestId('admin-movie-description').fill(description)
    await page.getByTestId('admin-movie-release').fill('2024-06-01')
    await page.getByTestId('admin-movie-duration').fill('100')
    await expect(page.getByTestId('admin-movie-title')).toHaveValue(title)
    await expect(page.getByTestId('admin-movie-description')).toHaveValue(description)
    await expect(page.getByTestId('admin-movie-release')).toHaveValue('2024-06-01')
    await expect(page.getByTestId('admin-movie-duration')).toHaveValue('100')
    const categorySelect = page.getByTestId('admin-movie-category')
    await expect(categorySelect.locator('option[value]:not([value=""])').first()).toBeAttached({
      timeout: 15_000,
    })
    await categorySelect.selectOption({ label: 'Action' })
    await expect(categorySelect).toHaveValue(/.+/)

    const createMovieResponse = page.waitForResponse(
      (res) => {
        if (res.request().method() !== 'POST') return false
        try {
          if (new URL(res.url()).pathname !== '/api/movies') return false
        } catch {
          return false
        }
        const raw = res.request().postData()
        // postData() peut être null selon le client ; le titre est unique dans ce test.
        return raw != null && raw.includes(title)
      },
      { timeout: 30_000 }
    )
    await page.getByTestId('admin-movie-submit').click()
    const createRes = await createMovieResponse
    if (createRes.status() !== 201) {
      throw new Error(`POST /api/movies → ${createRes.status()}: ${await createRes.text()}`)
    }
    // Ne pas utiliser /\/admin\/movies/ : ça matche aussi /admin/movies/create (sous-chaîne « /admin/movies/ »).
    await expect(page).toHaveURL(
      (url) => new URL(url).pathname.replace(/\/$/, '') === '/admin/movies',
      { timeout: 30_000 }
    )
    await expect(page.getByText(title, { exact: true })).toBeVisible()
  })
})
