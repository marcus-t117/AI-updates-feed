import { XMLParser } from 'fast-xml-parser'
import { fetchWithTimeout } from '../fetch-with-timeout'
import { truncateSummary, type RawFeedItem } from '../../types'

// nitter.net works when a browser User-Agent is provided — without it, returns empty body.
const NITTER_BASE = 'https://nitter.net'
const ACCOUNTS = ['AnthropicAI', 'borisochernyi', 'trq212', 'noahzweben']
const parser = new XMLParser({ ignoreAttributes: false, processEntities: false })
const BROWSER_UA = 'Mozilla/5.0 (X11; Linux x86_64; rv:115.0) Gecko/20100101 Firefox/115.0'

async function fetchAccount(handle: string): Promise<RawFeedItem[]> {
  try {
    const res = await fetchWithTimeout(
      `${NITTER_BASE}/${handle}/rss`,
      10_000,
      { 'User-Agent': BROWSER_UA }
    )
    if (!res.ok) return []
    const xml = await res.text()
    const parsed = parser.parse(xml)
    const items = parsed?.rss?.channel?.item
    if (!items) return []
    const list = Array.isArray(items) ? items : [items]
    return list
      .filter((item: any) => item.link && item.title && item.pubDate)
      .map((item: any) => ({
        url: (item.link as string).replace('https://nitter.net', 'https://x.com'),
        title: item.title,
        summary: truncateSummary(item.description ?? null),
        source: 'x_twitter' as const,
        author: `@${handle}`,
        publishedAt: new Date(item.pubDate),
      }))
  } catch {
    return []
  }
}

export async function fetchXRssHub(): Promise<RawFeedItem[]> {
  const results = await Promise.allSettled(ACCOUNTS.map(fetchAccount))
  return results
    .filter((r): r is PromiseFulfilledResult<RawFeedItem[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
}
