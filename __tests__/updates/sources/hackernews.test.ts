import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/features/updates/lib/fetch-with-timeout', () => ({
  fetchWithTimeout: vi.fn()
}))

import { fetchWithTimeout } from '@/features/updates/lib/fetch-with-timeout'
import { fetchHackerNews } from '@/features/updates/lib/sources/hackernews'

const HN_RESPONSE = {
  hits: [
    {
      objectID: '12345',
      title: 'Ask HN: Claude Code workflow tips',
      url: 'https://example.com/article',
      story_text: 'What workflows do you use?',
      created_at: '2026-01-05T10:00:00.000Z',
    }
  ]
}

beforeEach(() => vi.clearAllMocks())

describe('fetchHackerNews', () => {
  it('uses HN story permalink as url, not linked article', async () => {
    vi.mocked(fetchWithTimeout).mockResolvedValue({
      ok: true,
      json: async () => HN_RESPONSE,
    } as any)
    const items = await fetchHackerNews()
    expect(items).toHaveLength(1)
    expect(items[0].url).toBe('https://news.ycombinator.com/item?id=12345')
    expect(items[0].title).toBe('Ask HN: Claude Code workflow tips')
    expect(items[0].source).toBe('hackernews')
    expect(items[0].author).toBeNull()
  })

  it('returns empty array if response has no hits', async () => {
    vi.mocked(fetchWithTimeout).mockResolvedValue({
      ok: true,
      json: async () => ({ hits: [] }),
    } as any)
    expect(await fetchHackerNews()).toEqual([])
  })

  it('returns empty array on fetch failure', async () => {
    vi.mocked(fetchWithTimeout).mockResolvedValue({ ok: false } as any)
    expect(await fetchHackerNews()).toEqual([])
  })
})
