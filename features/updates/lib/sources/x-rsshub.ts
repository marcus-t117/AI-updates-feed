import { XMLParser } from 'fast-xml-parser'
import { fetchWithTimeout } from '../fetch-with-timeout'
import { truncateSummary, type RawFeedItem } from '../../types'

// X/Twitter RSS is dead (all Nitter instances blocked, RSSHub Twitter module returns 404).
// Replaced with TechCrunch AI section which covers the same AI industry news beat.
const URL = 'https://techcrunch.com/category/artificial-intelligence/feed/'
const parser = new XMLParser({ ignoreAttributes: false, processEntities: false })

export async function fetchXRssHub(): Promise<RawFeedItem[]> {
  try {
    const res = await fetchWithTimeout(URL)
    if (!res.ok) return []
    const xml = await res.text()
    const parsed = parser.parse(xml)
    const items = parsed?.rss?.channel?.item
    if (!items) return []
    const list = Array.isArray(items) ? items : [items]
    return list
      .filter((item: any) => item.link && item.title && item.pubDate)
      .map((item: any) => ({
        url: item.link,
        title: item.title,
        summary: truncateSummary(item.description ?? null),
        source: 'x_twitter' as const,
        author: null,
        publishedAt: new Date(item.pubDate),
      }))
  } catch {
    return []
  }
}
