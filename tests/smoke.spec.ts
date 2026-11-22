import { test, expect } from '@playwright/test'
import { captureConsoleErrors } from './helpers/errors'

/**
 * Smoke tests covering both page kinds this template ships:
 *   - '/'      → the static landing (top level of src/pages/): no providers,
 *                so no auth fetch and no records WebSocket on load.
 *   - '/home'  → a dynamic page (under src/pages/(app)/): the providers mount,
 *                the nav shell renders, and the records WebSocket connects.
 *
 * The "static contract" test is the guardrail for the per-page opt-out: if
 * someone moves the providers back up into _app.tsx, it fails.
 */

/** Wait for the React app shell (present on every page). */
async function waitForApp(page: import('@playwright/test').Page) {
  await page.waitForSelector('[data-testid="app-root"]', { timeout: 15000 })
}

test.describe('Smoke tests', () => {
  test('static landing loads without JS errors', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto('/')
    await waitForApp(page)
    await expect(page.getByTestId('static-landing')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('landing carries one title, one description, one canonical', async ({ page }) => {
    // <Seo> (src/pages/index.tsx, values from src/seo.ts) hoists these into
    // <head>. Exactly one of each: index.html ships no static description or
    // canonical, because React 19 would not dedupe against them on mount.
    await page.goto('/')
    await expect(page.getByTestId('static-landing')).toBeVisible()
    await expect(page).toHaveTitle(/\S/)
    expect(await page.locator('head meta[name="description"]').count()).toBe(1)
    expect(await page.locator('head link[rel="canonical"]').count()).toBe(1)
  })

  test('keyboard users can skip directly to the activity', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
  })

  test('static contract: landing fires no auth request, opens no websocket', async ({ page }) => {
    const offenders: string[] = []
    page.on('request', (req) => {
      if (req.url().includes('/api/auth/')) offenders.push(req.url())
    })
    // Only the DO room route counts — vite's own HMR socket is a dev artifact.
    page.on('websocket', (ws) => {
      if (new URL(ws.url()).pathname.startsWith('/ws/')) offenders.push(`ws: ${ws.url()}`)
    })
    await page.goto('/')
    await expect(page.getByTestId('static-landing')).toBeVisible()
    await page.waitForTimeout(1500)
    expect(offenders).toEqual([])
  })

  test('sample shows the chosen guess and keeps the stage in projector view', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'See what remains' })).toBeDisabled()
    await page.getByRole('button', { name: 'Guess 16', exact: true }).click()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByText('15 possibilities remain · 17 to 31')).toBeVisible()

    await page.getByRole('button', { name: 'Present', exact: true }).click()
    const projector = page.getByRole('dialog', { name: 'Projector view' })
    await expect(projector).toBeVisible()
    await projector.getByRole('button', { name: 'Reveal the next guess' }).click()
    await expect(projector.getByRole('heading', { name: 'Guess 24 next.' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(projector).toBeHidden()

    await page.getByRole('button', { name: 'Start over' }).click()
    await page.getByRole('button', { name: 'Guess 1', exact: true }).click()
    await page.getByRole('button', { name: 'See what remains' }).click()
    await expect(page.getByText('30 possibilities remain · 2 to 31')).toBeVisible()
  })

  test('dynamic app boundary mounts on /home', async ({ page }) => {
    await page.goto('/')
    const header = page.getByRole('navigation', { name: 'Workshop navigation' })
    await expect(header.getByRole('link', { name: 'Sample lesson' })).toHaveAttribute('aria-current', 'page')
    await header.getByRole('link', { name: 'Lesson builder' }).click()
    await expect(page.getByTestId('app-navigation')).toBeVisible({ timeout: 15000 })
    await expect(header.getByRole('link', { name: 'Lesson builder' })).toHaveAttribute('aria-current', 'page')
  })

  test('sign-in button visible when logged out', async ({ page }) => {
    await page.goto('/home')
    await expect(page.getByTestId('nav-sign-in-button')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('nav-user-name')).toHaveCount(0)
  })

  test('settings apply without signing in and preferences survive reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    const authRequests: string[] = []
    await page.route('**/api/auth/**', (route) => {
      authRequests.push(route.request().url())
      return route.abort()
    })
    await page.goto('/')
    await page.getByRole('link', { name: 'Settings', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

    const preview = page.getByText('Which number would you guess first?', { exact: true })
    const initialSize = await preview.evaluate((node) => parseFloat(getComputedStyle(node).fontSize))
    await page.getByRole('radio', { name: 'Dark', exact: true }).check()
    await page.getByRole('radio', { name: 'Extra large' }).check()
    await expect(page.locator('.workshop-surface')).toHaveCSS('background-color', 'rgb(21, 33, 26)')
    expect(await preview.evaluate((node) => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThan(initialSize)

    await page.reload()
    await expect(page.getByRole('radio', { name: 'Dark', exact: true })).toBeChecked()
    await expect(page.getByRole('radio', { name: 'Extra large' })).toBeChecked()
    await page.getByRole('link', { name: 'Try the sample lesson' }).click()
    await page.getByRole('button', { name: 'Present', exact: true }).click()
    await expect(page.getByRole('dialog').getByRole('heading')).toHaveCSS('font-size', '83.2px')

    await page.keyboard.press('Escape')
    await page.getByRole('link', { name: 'Settings', exact: true }).click()
    await page.getByRole('button', { name: 'Reset defaults' }).click()
    await expect(page.getByRole('radio', { name: 'System', exact: true })).toBeChecked()
    await expect(page.locator('.workshop-surface')).toHaveCSS('background-color', 'rgb(247, 247, 241)')
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page.locator('.workshop-surface')).toHaveCSS('background-color', 'rgb(21, 33, 26)')
    await page.getByRole('link', { name: 'Data and use' }).click()
    await expect(page.getByRole('heading', { name: 'Privacy policy' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Terms of use' })).toBeVisible()
    expect(authRequests).toEqual([])
  })

  test('umbrella lesson runs both branches and shows the corresponding JavaScript', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Try the if/else lesson' }).click()
    await expect(page.getByRole('heading', { name: 'Bring an umbrella?' })).toBeVisible()
    const start = page.getByRole('button', { name: 'Test your prediction' })
    await expect(start).toBeDisabled()
    await page.getByRole('button', { name: 'Bring an umbrella', exact: true }).click()
    await start.click()

    await page.getByRole('button', { name: 'Run program' }).click()
    await expect(page.getByRole('status')).toContainText('IF branch ran')
    const explain = page.getByRole('button', { name: 'Explain the branches' })
    await expect(explain).toBeDisabled()
    await page.getByRole('button', { name: 'Clear', exact: true }).click()
    await expect(page.getByRole('status')).not.toContainText('IF branch ran')
    await page.getByRole('button', { name: 'JavaScript', exact: true }).click()
    await expect(page.locator('pre')).toContainText('const isRaining = false;')
    await page.getByRole('button', { name: 'Run program' }).click()
    await expect(page.getByRole('status')).toContainText('ELSE branch ran')
    await explain.click()
    await expect(page.getByRole('heading', { name: 'One condition. Two possible paths.' })).toBeVisible()
  })

  test('unknown route shows 404', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz')
    await waitForApp(page)
    await expect(page.locator('text=404')).toBeVisible()
  })
})
