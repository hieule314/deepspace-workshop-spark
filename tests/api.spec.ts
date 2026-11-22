import { test, expect } from '@playwright/test'

test.describe('API tests', () => {
  test('auth proxy forwards to auth worker', async ({ request }) => {
    const res = await request.get('/api/auth/ok')
    expect(res.ok()).toBeTruthy()
  })

  test('builder receives data from its scoped records WebSocket', async ({ page }) => {
    const firstFrame = new Promise((resolve) => {
      page.on('websocket', (socket) => {
        if (new URL(socket.url()).pathname.startsWith('/ws/')) {
          socket.once('framereceived', (frame) => resolve(frame.payload))
        }
      })
    })
    await page.goto('/home')
    expect(await firstFrame).toBeTruthy()
  })

  test('signed-out callers cannot start generation or reach its paid providers', async ({ request }) => {
    const generate = await request.post('/api/actions/generateLesson', { data: { topic: 'if-else' } })
    expect(generate.status()).toBe(401)
    const provider = await request.post('/api/integrations/openai/chat-completion', { data: {} })
    expect(provider.status()).toBe(404)
  })

  test('generation rejects an oversized payload', async ({ request }) => {
    const res = await request.post('/api/actions/generateLesson', { data: { topic: 'if-else', notes: 'x'.repeat(9_000) } })
    expect(res.status()).toBe(413)
  })
})
