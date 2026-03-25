import { XMLParser } from 'fast-xml-parser'
import { fetchWithTimeout } from '../fetch-with-timeout'
import { truncateSummary, type RawFeedItem } from '../../types'

// Anthropic has no native blog RSS. Using Google News RSS filtered to site:anthropic.com
// as the best available source for official Anthropic news and blog posts.
const URL = 'https://news.google.com/rss/search?q=site:anthropic.com&hl=en-US&gl=US&ceid=US:en'
const parser = new XMLParser({ ignoreAttributes: false, processEntities: false })

export async function fetchAnthropicBlog(): Promise<RawFeedItem[]> {
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
        // Skip noise: generic pages like Jobs, Login, Category pages
        if (/^(jobs|login|careers)\s*[-|]/i.test(item.title)) return false
        return true
      })
      .map((item: any) => ({
        url: item.link,
        title: item.title,
        summary: truncateSummary(item.description ?? null),
        source: 'anthropic_blog' as const,
        author: null,
        publishedAt: new Date(item.pubDate),
      }))
  } catch {
    return []
  }
}
