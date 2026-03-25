import { XMLParser } from 'fast-xml-parser'
import { fetchWithTimeout } from '../fetch-with-timeout'
import { truncateSummary, type RawFeedItem } from '../../types'

// The original rsshub.app/telegram/channel/releasebot returned 403 (@releasebot is a bot, not a channel).
// Replaced with Product Hunt AI category feed which tracks new AI tool launches.
const URL = 'https://www.producthunt.com/feed?category=artificial-intelligence'
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
      .filter((item: any) => item.link && item.title && item.pubDate)
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
