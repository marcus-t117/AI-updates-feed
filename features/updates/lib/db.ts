import { prisma } from '@/lib/prisma'
import type { RawFeedItem } from '../types'

export async function getLatestItems() {
  return prisma.feedItem.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 100,
  })
}

export async function getItemsSince(since: Date) {
  return prisma.feedItem.findMany({
    where: { publishedAt: { gt: since } },
    orderBy: { publishedAt: 'desc' },
  })
}

export async function insertItems(items: RawFeedItem[]) {
  const result = await prisma.feedItem.createMany({
    data: items,
    skipDuplicates: true,
  })
  return result.count
}

export async function deleteOldItems() {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)
  const result = await prisma.feedItem.deleteMany({
    where: { fetchedAt: { lt: cutoff } },
  })
  return result.count
}
