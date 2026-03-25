import { XMLParser } from 'fast-xml-parser'
import { fetchWithTimeout } from '../fetch-with-timeout'
import { truncateSummary, type RawFeedItem } from '../../types'

const URL = 'https://news.google.com/rss/search?q=site:claude.com/blog&hl=en-US&gl=US&ceid=US:en'
const parser = new XMLParser({ ignoreAttributes: false, processEntities: false })

export async function fetchClaudeBlog(): Promise<RawFeedItem[]> {
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
        // Skip category/tag/archive index pages from Google News results
        if (/\b(category|categories|tag|archive|page \d)\b/i.test(item.title)) return false
        // Skip titles that are just "Topic | Blog - Claude" (index page pattern, no article content)
        if (/^[^|]{1,40}\s*\|\s*Blog\s*[-–]\s*Claude$/i.test(item.title)) return false
        return true
      })
      .map((item: any) => ({
        url: item.link,
        title: item.title,
        summary: truncateSummary(item.description ?? null),
        source: 'claude_blog' as const,
        author: null,
        publishedAt: new Date(item.pubDate),
      }))
  } catch {
    return []
  }
}
