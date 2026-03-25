import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/features/updates/lib/fetch-with-timeout', () => ({
  fetchWithTimeout: vi.fn()
}))

import { fetchWithTimeout } from '@/features/updates/lib/fetch-with-timeout'
import { fetchReleasebot } from '@/features/updates/lib/sources/releasebot'

const RSS_XML = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Claude Code 1.5 released</title>
      <link>https://releasebot.io/releases/claude-code-1.5</link>
      <description>New release notes.</description>
      <pubDate>Tue, 10 Feb 2026 09:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`

beforeEach(() => vi.clearAllMocks())

describe('fetchReleasebot', () => {
  it('parses RSS items correctly', async () => {
    vi.mocked(fetchWithTimeout).mockResolvedValue({
      ok: true,
      text: async () => RSS_XML,
    } as any)
    const items = await fetchReleasebot()
    expect(items).toHaveLength(1)
    expect(items[0].source).toBe('releasebot')
    expect(items[0].url).toBe('https://releasebot.io/releases/claude-code-1.5')
  })

  it('returns empty array on non-200', async () => {
    vi.mocked(fetchWithTimeout).mockResolvedValue({ ok: false } as any)
    expect(await fetchReleasebot()).toEqual([])
  })
})
