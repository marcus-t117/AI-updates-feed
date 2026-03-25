import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/features/updates/lib/fetch-with-timeout', () => ({
  fetchWithTimeout: vi.fn()
}))

import { fetchWithTimeout } from '@/features/updates/lib/fetch-with-timeout'
import { fetchAnthropicBlog } from '@/features/updates/lib/sources/anthropic-blog'

const RSS_XML = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Claude 4 Released</title>
      <link>https://www.anthropic.com/blog/claude-4</link>
      <description>Introducing Claude 4, our most capable model.</description>
      <pubDate>Wed, 01 Jan 2026 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`

beforeEach(() => vi.clearAllMocks())

describe('fetchAnthropicBlog', () => {
  it('parses RSS and returns RawFeedItems', async () => {
    vi.mocked(fetchWithTimeout).mockResolvedValue({
      ok: true,
      text: async () => RSS_XML,
    } as any)

    const items = await fetchAnthropicBlog()
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      url: 'https://www.anthropic.com/blog/claude-4',
      title: 'Claude 4 Released',
      source: 'anthropic_blog',
      author: null,
    })
    expect(items[0].publishedAt).toBeInstanceOf(Date)
    expect(items[0].summary).toBe('Introducing Claude 4, our most capable model.')
  })

  it('returns empty array if fetch fails', async () => {
    vi.mocked(fetchWithTimeout).mockResolvedValue({ ok: false } as any)
    const items = await fetchAnthropicBlog()
    expect(items).toEqual([])
  })

  it('returns empty array if fetch throws', async () => {
    vi.mocked(fetchWithTimeout).mockRejectedValue(new Error('timeout'))
    const items = await fetchAnthropicBlog()
    expect(items).toEqual([])
  })
})
