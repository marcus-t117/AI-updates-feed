import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/features/updates/lib/db', () => ({ getLatestItems: vi.fn() }))

import { getLatestItems } from '@/features/updates/lib/db'
import { GET } from '@/app/api/updates/feed.xml/route'

const mockItems = [
  {
    id: 'uuid-1',
    url: 'https://anthropic.com/blog/claude-4',
    title: 'Claude 4',
    summary: 'New model.',
    source: 'anthropic_blog',
    author: null,
    publishedAt: new Date('2026-01-10T10:00:00Z'),
    fetchedAt: new Date('2026-01-10T10:05:00Z'),
  }
]

beforeEach(() => vi.clearAllMocks())

describe('GET /api/updates/feed.xml', () => {
  it('returns RSS 2.0 XML with correct Content-Type', async () => {
    vi.mocked(getLatestItems).mockResolvedValue(mockItems as any)
    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('application/rss+xml')
  })

  it('includes items in the XML output', async () => {
    vi.mocked(getLatestItems).mockResolvedValue(mockItems as any)
    const res = await GET()
    const xml = await res.text()
    expect(xml).toContain('<rss')
    expect(xml).toContain('Claude 4')
    expect(xml).toContain('https://anthropic.com/blog/claude-4')
  })

  it('sets Cache-Control header', async () => {
    vi.mocked(getLatestItems).mockResolvedValue([])
    const res = await GET()
    expect(res.headers.get('Cache-Control')).toContain('max-age=600')
  })
})
