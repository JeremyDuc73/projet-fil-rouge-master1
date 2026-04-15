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
    await expect(page.getByRole('link', { name: /Voir tout/i })).toBeVisible({ timeout: 25_000 })
  })

  test('catalogue — recherche et filtres', async ({ page }) => {
    await login(page, E2E_USER, E2E_PASSWORD)
    await page.goto('/movies')

    await expect(page.getByRole('heading', { name: /Catalogue de Films/i })).toBeVisible()

    await page.getByTestId('catalog-search').fill('Alpha')
    await expect(page.getByTestId('movie-card').filter({ hasText: 'E2E Film Alpha' })).toBeVisible()
    await expect(page.getByTestId('movie-card')).toHaveCount(1)

    await page.getByTestId('catalog-search').clear()
    await expect(page.getByTestId('movie-card')).toHaveCount(2, { timeout: 10_000 })

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
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/api/favorites/') &&
          res.request().method() === 'POST' &&
          res.ok()
      ),
      card.getByTestId('movie-favorite-toggle').click(),
    ])
    await page.goto('/profile/favorites')
    await expect(page.getByText('E2E Film Alpha')).toBeVisible()
  })

  test('admin — création de film custom', async ({ page }) => {
    await login(page, E2E_ADMIN, E2E_PASSWORD)
    await page.goto('/admin/movies/create')

    const title = `E2E Create ${Date.now()}`
    await page.getByTestId('admin-movie-title').fill(title)
    await page.getByTestId('admin-movie-description').fill('Description créée par Playwright.')
    await page.getByTestId('admin-movie-release').fill('2024-06-01')
    await page.getByTestId('admin-movie-duration').fill('100')
    await page.getByTestId('admin-movie-category').selectOption({ index: 1 })

    await page.getByTestId('admin-movie-submit').click()
    await expect(page).toHaveURL(/\/admin\/movies/, { timeout: 30_000 })
    await expect(page.getByText(title)).toBeVisible()
  })
})
