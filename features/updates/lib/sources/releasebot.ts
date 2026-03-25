import { XMLParser } from 'fast-xml-parser'
import { fetchWithTimeout } from '../fetch-with-timeout'
import { truncateSummary, type RawFeedItem } from '../../types'

// TODO: confirm actual releasebot feed URL before deploying
const RELEASEBOT_URL = 'https://rsshub.app/telegram/channel/releasebot'
const parser = new XMLParser({ ignoreAttributes: false })

export async function fetchReleasebot(): Promise<RawFeedItem[]> {
  try {
    const res = await fetchWithTimeout(RELEASEBOT_URL)
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
