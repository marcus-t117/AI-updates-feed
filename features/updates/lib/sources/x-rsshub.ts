import { XMLParser } from 'fast-xml-parser'
import { fetchWithTimeout } from '../fetch-with-timeout'
import { truncateSummary, type RawFeedItem } from '../../types'

const ACCOUNTS = ['AnthropicAI', 'borisochernyi', 'trq212', 'noahzweben']
const BASE_URL = 'https://rsshub.app/twitter/user'
const parser = new XMLParser({ ignoreAttributes: false })

async function fetchAccount(handle: string): Promise<RawFeedItem[]> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/${handle}`)
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
