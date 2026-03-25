import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/features/updates/lib/fetch-with-timeout', () => ({
  fetchWithTimeout: vi.fn()
}))

import { fetchWithTimeout } from '@/features/updates/lib/fetch-with-timeout'
import { fetchGitHubReleases } from '@/features/updates/lib/sources/github-releases'

const ATOM_XML = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>claude-code 1.2.3</title>
    <link href="https://github.com/anthropics/claude-code/releases/tag/v1.2.3"/>
    <summary>Bug fixes and performance improvements.</summary>
    <updated>2026-01-10T08:00:00Z</updated>
  </entry>
</feed>`

beforeEach(() => vi.clearAllMocks())

describe('fetchGitHubReleases', () => {
  it('parses Atom and returns RawFeedItems', async () => {
    vi.mocked(fetchWithTimeout).mockResolvedValue({
      ok: true,
      text: async () => ATOM_XML,
    } as any)
    const items = await fetchGitHubReleases()
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      url: 'https://github.com/anthropics/claude-code/releases/tag/v1.2.3',
      title: 'claude-code 1.2.3',
      source: 'github_releases',
      author: null,
    })
    expect(items[0].publishedAt).toBeInstanceOf(Date)
  })

  it('returns empty array on fetch failure', async () => {
    vi.mocked(fetchWithTimeout).mockResolvedValue({ ok: false } as any)
    expect(await fetchGitHubReleases()).toEqual([])
  })
})
