import { XMLParser } from 'fast-xml-parser'
import { fetchWithTimeout } from '../fetch-with-timeout'
import { truncateSummary, type RawFeedItem } from '../../types'

// Claude Code / Claude product-specific news via Google News search.
// Catches release announcements, changelog posts, and product updates.
const URL = 'https://news.google.com/rss/search?q=%22Claude+Code%22+OR+%22Claude+AI%22+release+update&hl=en-US&gl=US&ceid=US:en'
const parser = new XMLParser({ ignoreAttributes: false, processEntities: false })

export async function fetchReleasebot(): Promise<RawFeedItem[]> {
  try {
    const res = await fetchWithTimeout(URL)
    if (!res.ok) return []
    const xml = await res.text()
    const parsed = parser.parse(xml)
    const items = parsed?.rss?.channel?.item
    if (!items) return []
    const list = Array.isArray(items) ? items : [items]
    return list
      .filter((item: any) => {
        if (!item.link || !item.title || !item.pubDate) return false
        // Skip obvious non-product pages (job listings, generic category pages)
        if (/\b(jobs?|careers?|hiring)\b/i.test(item.title)) return false
        return true
      })
      .map((item: any) => ({
        url: item.link,
        title: item.title,
        summary: truncateSummary(item.description ?? null),
        source: 'releasebot' as const,
        author: null,
        publishedAt: new Date(item.pubDate),
      }))
  } catch {
    return []
  }
}
