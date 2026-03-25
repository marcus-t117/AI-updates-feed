import { getLatestItems } from '@/features/updates/lib/db'
import { stripHtml } from '@/features/updates/types'
import type { FeedItem } from '@prisma/client'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const items = await getLatestItems()
  const latest50 = items.slice(0, 50)

  const itemsXml = latest50
    .map((item: FeedItem) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      ${item.summary ? `<description>${escapeXml(stripHtml(item.summary) ?? '')}</description>` : ''}
      <pubDate>${item.publishedAt.toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      ${item.author ? `<author>${escapeXml(item.author)}</author>` : ''}
    </item>`)
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Claude Updates</title>
    <link>https://demo.anthera.tech/updates</link>
    <description>Latest news and releases from Anthropic, Claude Code, and the Claude ecosystem.</description>
    <language>en</language>
    ${itemsXml}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'max-age=600, stale-while-revalidate=300',
    },
  })
}
