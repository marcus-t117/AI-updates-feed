export type Source =
  | 'anthropic_blog'
  | 'claude_blog'
  | 'github_releases'
  | 'hackernews'
  | 'x_twitter'
  | 'releasebot'

// Transport shape — dates as ISO strings for JSON serialisation
export interface FeedItem {
  id: string
  url: string
  title: string
  summary: string | null
  source: Source
  author: string | null
  publishedAt: string
  fetchedAt: string
}

// Shape produced by source fetchers before DB insert
export interface RawFeedItem {
  url: string
  title: string
  summary: string | null
  source: Source
  author: string | null
  publishedAt: Date
}

export const SOURCE_LABELS: Record<Source, string> = {
  anthropic_blog: 'Anthropic',
  claude_blog: 'Claude Blog',
  github_releases: 'GitHub',
  hackernews: 'HackerNews',
  x_twitter: 'X',
  releasebot: 'releasebot',
}

// Truncate at word boundary, max 300 chars. Returns null if input is null/empty.
export function truncateSummary(text: string | null | undefined): string | null {
  if (!text) return null
  const trimmed = text.trim()
  if (trimmed.length <= 300) return trimmed
  const cut = trimmed.slice(0, 300)
  const lastSpace = cut.lastIndexOf(' ')
  return lastSpace > 0 ? cut.slice(0, lastSpace) : cut
}
