import { XMLParser } from 'fast-xml-parser'
import { fetchWithTimeout } from '../fetch-with-timeout'
import { truncateSummary, type RawFeedItem } from '../../types'

const URL = 'https://github.com/anthropics/claude-code/releases.atom'
// processEntities: false prevents entity expansion limit errors on release notes with heavy HTML
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', processEntities: false })

export async function fetchGitHubReleases(): Promise<RawFeedItem[]> {
  try {
    const res = await fetchWithTimeout(URL)
    if (!res.ok) return []
    const xml = await res.text()
    const parsed = parser.parse(xml)
    const entries = parsed?.feed?.entry
    if (!entries) return []
    const list = Array.isArray(entries) ? entries : [entries]
    return list
      .map((e: any) => {
        const url = e.link?.['@_href'] ?? e.link ?? ''
        return {
          url,
          title: e.title?.['#text'] ?? e.title ?? '',
          summary: truncateSummary(e.summary?.['#text'] ?? e.summary ?? null),
          source: 'github_releases' as const,
          author: null,
          publishedAt: new Date(e.updated ?? e.published),
        }
      })
      .filter((item: RawFeedItem) => item.url && item.title)
  } catch {
    return []
  }
}
