import { getLatestItems } from '@/features/updates/lib/db'
import { FeedList } from '@/features/updates/components/FeedList'
import type { FeedItem } from '@/features/updates/types'

export const dynamic = 'force-dynamic'

export default async function UpdatesPage() {
  const rows = await getLatestItems()
  const items: FeedItem[] = rows.map((row) => ({
    ...row,
    publishedAt: row.publishedAt.toISOString(),
    fetchedAt: row.fetchedAt.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-[#1c1c1c]">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <FeedList initialItems={items} />
      </main>
    </div>
  )
}
