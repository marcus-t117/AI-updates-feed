import { fetchWithTimeout } from '../fetch-with-timeout'
import { truncateSummary, type RawFeedItem } from '../../types'

const HN_URL = 'https://hn.algolia.com/api/v1/search?query=Claude+Code&tags=story&hitsPerPage=20'

export async function fetchHackerNews(): Promise<RawFeedItem[]> {
  try {
    const res = await fetchWithTimeout(HN_URL)
    if (!res.ok) return []
    const data = await res.json()
    const hits = data?.hits
    if (!Array.isArray(hits)) return []
    return hits
      .filter((h: any) => h.objectID && h.title && h.created_at)
      .map((h: any) => ({
        url: `https://news.ycombinator.com/item?id=${h.objectID}`,
        title: h.title,
        summary: truncateSummary(h.story_text ?? null),
        source: 'hackernews' as const,
        author: null,
        publishedAt: new Date(h.created_at),
      }))
  } catch {
    return []
  }
}
