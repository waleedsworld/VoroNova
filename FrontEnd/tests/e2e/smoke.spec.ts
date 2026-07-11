import { test, expect } from '@playwright/test'

// End-to-end smoke tests for VoroNova, run against the real static export.
// They cover the three user-facing routes and the primary navigation flow
// (landing -> design studio), which is the app's core journey.

test.describe('Landing page (/)', () => {
  test('loads, has the correct document title, and reveals the hero after the loading screen', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/VoroNova/i)

    // The landing route shows a ~2s loading screen, then the main content.
    // The nav "Get Started" CTA is the reliable "app is interactive" signal.
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible({ timeout: 15_000 })

    // The hero headline renders in a responsive layout (mobile + desktop copies);
    // assert the one that is actually visible for this viewport.
    await expect(
      page.getByText('AI-Powered Space Habitat Design').filter({ visible: true }),
    ).toBeVisible()
  })

  test('primary CTA navigates to the design studio', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByRole('link', { name: 'Get Started' })
    await expect(cta).toBeVisible({ timeout: 15_000 })

    await cta.click()

    await expect(page).toHaveURL(/\/app\/?$/)
    await expect(
      page.getByText('Chat with your habitat design helper').filter({ visible: true }),
    ).toBeVisible({ timeout: 15_000 })
  })
})

test.describe('Design studio (/app)', () => {
  test('loads the questionnaire chat interface', async ({ page }) => {
    await page.goto('/app/')

    await expect(
      page.getByText('Chat with your habitat design helper').filter({ visible: true }),
    ).toBeVisible({ timeout: 15_000 })
    // The right-hand preview panel prompts the user before a plan exists.
    await expect(
      page.getByText('Complete the questionnaire to generate floor plans').filter({ visible: true }),
    ).toBeVisible()
  })
})

test.describe('Results / editor (/results)', () => {
  test('loads the design analysis view with its core panels', async ({ page }) => {
    await page.goto('/results/')

    await expect(page.getByRole('button', { name: /Analyze/ }).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('AI Suggestions').filter({ visible: true })).toBeVisible()
    await expect(page.getByText('Design Metrics').filter({ visible: true })).toBeVisible()
  })
})

test.describe('Static hosting behaviour', () => {
  test('unknown routes return the 404 page', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist/')
    expect(response?.status()).toBe(404)
  })
})
