import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    feedItem: {
      findMany: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    }
  }
}))

import { prisma } from '@/lib/prisma'
import { getLatestItems, getItemsSince, insertItems, deleteOldItems } from '@/features/updates/lib/db'

const mockItem = {
  id: 'uuid-1',
  url: 'https://example.com',
  title: 'Test',
  summary: null,
  source: 'anthropic_blog',
  author: null,
  publishedAt: new Date('2026-01-01'),
  fetchedAt: new Date('2026-01-01'),
}

beforeEach(() => vi.clearAllMocks())

describe('getLatestItems', () => {
  it('queries 100 items ordered by publishedAt desc', async () => {
    vi.mocked(prisma.feedItem.findMany).mockResolvedValue([mockItem] as any)
    const result = await getLatestItems()
    expect(prisma.feedItem.findMany).toHaveBeenCalledWith({
      orderBy: { publishedAt: 'desc' },
      take: 100,
    })
    expect(result).toHaveLength(1)
  })
})

describe('getItemsSince', () => {
  it('returns items with publishedAt after the given date', async () => {
    const since = new Date('2026-01-15')
    vi.mocked(prisma.feedItem.findMany).mockResolvedValue([])
    await getItemsSince(since)
    expect(prisma.feedItem.findMany).toHaveBeenCalledWith({
      where: { publishedAt: { gt: since } },
      orderBy: { publishedAt: 'desc' },
    })
  })
})

describe('insertItems', () => {
  it('calls createMany with skipDuplicates and returns inserted count', async () => {
    vi.mocked(prisma.feedItem.createMany).mockResolvedValue({ count: 3 })
    const items = [
      { url: 'https://a.com', title: 'A', summary: null, source: 'anthropic_blog' as const, author: null, publishedAt: new Date() },
    ]
    const count = await insertItems(items)
    expect(prisma.feedItem.createMany).toHaveBeenCalledWith({ data: items, skipDuplicates: true })
    expect(count).toBe(3)
  })
})

describe('deleteOldItems', () => {
  it('deletes items where fetchedAt is older than 90 days', async () => {
    vi.mocked(prisma.feedItem.deleteMany).mockResolvedValue({ count: 7 })
    const count = await deleteOldItems()
    const call = vi.mocked(prisma.feedItem.deleteMany).mock.calls[0][0]
    expect(call?.where?.fetchedAt?.lt).toBeInstanceOf(Date)
    expect(count).toBe(7)
  })
})
