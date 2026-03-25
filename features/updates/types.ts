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
  releasebot: 'Claude Updates',
}

// Strip HTML tags and decode common entities from feed descriptions
export function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null
  return html
    // Decode entities first, then strip tags (order matters)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, ' ')   // complete tags
    .replace(/<[^>]*$/, '')     // partial/truncated tag at end
    .replace(/\s+/g, ' ')
    .trim() || null
}

// Truncate at word boundary, max 300 chars. Returns null if input is null/empty.
export function truncateSummary(text: string | null | undefined): string | null {
  const clean = stripHtml(text)
  if (!clean) return null
  if (clean.length <= 300) return clean
  const cut = clean.slice(0, 300)
  const lastSpace = cut.lastIndexOf(' ')
  return lastSpace > 0 ? cut.slice(0, lastSpace) : cut
}
