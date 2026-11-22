import type { ActionTools } from 'deepspace/worker'
import { describe, expect, it, vi } from 'vitest'
import { generateLesson } from './generate-lesson'
import { APP_DAILY_LIMIT } from '../lib/workshops'

const draft = {
  title: 'Guess the midpoint',
  steps: [
    { prompt: 'Where do you start?', instruction: 'Predict the first guess.' },
    { prompt: 'Try a guess', instruction: 'Cross out half the options.' },
    { prompt: 'Pick the middle', instruction: 'The middle bounds the worst case.' },
  ],
}

function setup() {
  const query = vi.fn().mockResolvedValue({ success: true, data: { records: [], count: 0 } })
  const create = vi.fn().mockResolvedValue({ success: true, data: { recordId: 'created' } })
  const integration = vi.fn()
    .mockResolvedValueOnce({ success: true, data: {
      title: 'Binary search algorithm',
      url: 'https://en.wikipedia.org/wiki/Binary_search_algorithm',
      extract: 'Binary search works on sorted data.',
    } })
    .mockResolvedValueOnce({ success: true, data: {
      choices: [{ message: { content: JSON.stringify(draft) } }],
    } })
  const tools = { query, create, integration } as unknown as ActionTools
  const run = (topic: string, details: Record<string, string> = {}) => generateLesson({
    userId: 'facilitator-a',
    params: { topic, ...details },
    tools,
    env: {} as Parameters<typeof generateLesson>[0]['env'],
    callerJwt: '',
  })
  return { run, create, integration, query }
}

describe('generateLesson', () => {
  it('saves the lesson even if the optional video search fails', async () => {
    const { run, create, integration } = setup()
    integration.mockRejectedValueOnce(new Error('Timed out'))

    const result = await run('binary-search')

    expect(result).toMatchObject({ success: true, data: { lesson: { ...draft, videos: [] } } })
    expect(create).toHaveBeenLastCalledWith('lessons', { lesson: expect.objectContaining({ title: draft.title }) })
    expect(integration.mock.calls.map(([endpoint]) => endpoint)).toEqual([
      'wikipedia/get-page-summary', 'openai/chat-completion', 'youtube/search-videos',
    ])
  })

  it('does not call providers when a concurrent reservation fills the last slot', async () => {
    const { run, create, integration, query } = setup()
    const attempts = Array.from({ length: APP_DAILY_LIMIT }, () => ({ createdBy: 'another-user' }))
    query
      .mockResolvedValueOnce({ success: true, data: { records: attempts.slice(1) } })
      .mockResolvedValueOnce({ success: true, data: { records: attempts } })
    create.mockResolvedValueOnce({ success: false, error: 'Duplicate: a record with day, slot already exists' })

    const result = await run('binary-search')

    expect(result).toMatchObject({ success: false, error: expect.stringContaining('daily generation limit') })
    expect(integration).not.toHaveBeenCalled()
  })

  it('uses custom notes for generation and saves a usable diagram without a reference', async () => {
    const { run, create, integration } = setup()
    const diagram = {
      title: 'Set out three cards',
      layout: 'sequence',
      items: [{ label: 'A', detail: 'Start here' }, { label: 'B' }, { label: 'C' }],
    }
    const customDraft = {
      ...draft,
      materials: ['Index cards'],
      steps: [draft.steps[0], { ...draft.steps[1], diagram }, { ...draft.steps[2], diagram: { layout: 'html' } }],
    }
    integration.mockReset()
      .mockResolvedValueOnce({ success: true, data: [] })
      .mockResolvedValueOnce({ success: true, data: {
        choices: [{ message: { content: JSON.stringify(customDraft) } }],
      } })
      .mockResolvedValueOnce({ success: true, data: { videos: [] } })

    const result = await run('custom', { customTopic: '  Computer sound  ', notes: 'Use index cards.' })

    expect(integration).toHaveBeenNthCalledWith(1, 'wikipedia/search-pages', { query: 'Computer sound', limit: 1 })
    const completionBody = integration.mock.calls[1][1]
    expect(JSON.parse(completionBody.messages[1].content)).toEqual({
      topic: 'Computer sound',
      notes: 'Use index cards.',
    })
    expect(integration).toHaveBeenLastCalledWith('youtube/search-videos', {
      q: 'Computer sound beginner computer science explained', maxResults: 2,
    })
    expect(result).toMatchObject({
      success: true,
      data: { lesson: {
        topic: 'Computer sound',
        materials: ['Index cards'],
        source: null,
        steps: [draft.steps[0], { ...draft.steps[1], diagram }, draft.steps[2]],
      } },
    })
    expect(create).toHaveBeenLastCalledWith('lessons', { lesson: expect.objectContaining({ materials: ['Index cards'] }) })
  })

  it('rejects blank custom topics before reserving an attempt', async () => {
    const { run, create, integration } = setup()
    expect(await run('custom', { customTopic: '   ' })).toMatchObject({ success: false })
    expect(create).not.toHaveBeenCalled()
    expect(integration).not.toHaveBeenCalled()
  })
})
