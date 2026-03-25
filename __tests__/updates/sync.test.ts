import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/features/updates/lib/sources/anthropic-blog', () => ({ fetchAnthropicBlog: vi.fn() }))
vi.mock('@/features/updates/lib/sources/github-releases', () => ({ fetchGitHubReleases: vi.fn() }))
vi.mock('@/features/updates/lib/sources/hackernews', () => ({ fetchHackerNews: vi.fn() }))
vi.mock('@/features/updates/lib/sources/releasebot', () => ({ fetchReleasebot: vi.fn() }))
vi.mock('@/features/updates/lib/sources/x-rsshub', () => ({ fetchXRssHub: vi.fn() }))
vi.mock('@/features/updates/lib/db', () => ({ insertItems: vi.fn() }))

import { fetchAnthropicBlog } from '@/features/updates/lib/sources/anthropic-blog'
import { fetchGitHubReleases } from '@/features/updates/lib/sources/github-releases'
import { fetchHackerNews } from '@/features/updates/lib/sources/hackernews'
import { fetchReleasebot } from '@/features/updates/lib/sources/releasebot'
import { fetchXRssHub } from '@/features/updates/lib/sources/x-rsshub'
import { insertItems } from '@/features/updates/lib/db'
import { runSync } from '@/features/updates/lib/sync'

const mockItem = (url: string) => ({
  url,
  title: 'Test',
  summary: null,
  source: 'anthropic_blog' as const,
  author: null,
  publishedAt: new Date(),
})

beforeEach(() => vi.clearAllMocks())

describe('runSync', () => {
  it('fetches all sources and inserts results', async () => {
    vi.mocked(fetchAnthropicBlog).mockResolvedValue([mockItem('https://a.com')])
    vi.mocked(fetchGitHubReleases).mockResolvedValue([mockItem('https://b.com')])
    vi.mocked(fetchHackerNews).mockResolvedValue([mockItem('https://c.com')])
    vi.mocked(fetchReleasebot).mockResolvedValue([])
    vi.mocked(fetchXRssHub).mockResolvedValue([])
    vi.mocked(insertItems).mockResolvedValue(3)

    const result = await runSync()
    expect(insertItems).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ url: 'https://a.com' }),
      expect.objectContaining({ url: 'https://b.com' }),
      expect.objectContaining({ url: 'https://c.com' }),
    ]))
    expect(result.inserted).toBe(3)
    expect(result.errors).toEqual([])
  })

  it('reports errors for rejected sources but still inserts successful ones', async () => {
    vi.mocked(fetchAnthropicBlog).mockRejectedValue(new Error('network error'))
    vi.mocked(fetchGitHubReleases).mockResolvedValue([mockItem('https://b.com')])
    vi.mocked(fetchHackerNews).mockResolvedValue([])
    vi.mocked(fetchReleasebot).mockResolvedValue([])
    vi.mocked(fetchXRssHub).mockResolvedValue([])
    vi.mocked(insertItems).mockResolvedValue(1)

    const result = await runSync()
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('anthropic_blog')
    expect(result.inserted).toBe(1)
  })

  it('returns inserted 0 and skipped 0 when all sources return empty', async () => {
    vi.mocked(fetchAnthropicBlog).mockResolvedValue([])
    vi.mocked(fetchGitHubReleases).mockResolvedValue([])
    vi.mocked(fetchHackerNews).mockResolvedValue([])
    vi.mocked(fetchReleasebot).mockResolvedValue([])
    vi.mocked(fetchXRssHub).mockResolvedValue([])

    const result = await runSync()
    expect(insertItems).not.toHaveBeenCalled()
    expect(result.inserted).toBe(0)
    expect(result.skipped).toBe(0)
  })
})
