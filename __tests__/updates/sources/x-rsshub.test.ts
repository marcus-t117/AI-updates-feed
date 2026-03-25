import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/features/updates/lib/fetch-with-timeout', () => ({
  fetchWithTimeout: vi.fn()
}))

import { fetchWithTimeout } from '@/features/updates/lib/fetch-with-timeout'
import { fetchXRssHub } from '@/features/updates/lib/sources/x-rsshub'

const makeRss = (handle: string) => `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Post from ${handle}</title>
      <link>https://x.com/${handle}/status/999</link>
      <description>Some tweet content.</description>
      <pubDate>Mon, 05 Jan 2026 08:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`

beforeEach(() => vi.clearAllMocks())

describe('fetchXRssHub', () => {
  it('fetches all four accounts and returns merged items with @handle as author', async () => {
    vi.mocked(fetchWithTimeout).mockImplementation(async (url: string) => {
      const handle = url.split('/').pop()!
      return { ok: true, text: async () => makeRss(handle) } as any
    })
    const items = await fetchXRssHub()
    expect(items).toHaveLength(4)
    const authors = items.map((i) => i.author)
    expect(authors).toContain('@AnthropicAI')
    expect(authors).toContain('@borisochernyi')
    items.forEach((item) => expect(item.source).toBe('x_twitter'))
  })

  it('skips accounts that return non-200 without failing the whole fetch', async () => {
    let callCount = 0
    vi.mocked(fetchWithTimeout).mockImplementation(async () => {
      callCount++
      if (callCount === 1) return { ok: false } as any
      return { ok: true, text: async () => makeRss('test') } as any
    })
    const items = await fetchXRssHub()
    expect(items.length).toBeGreaterThanOrEqual(3)
  })
})
