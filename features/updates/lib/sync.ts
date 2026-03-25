import { fetchAnthropicBlog } from './sources/anthropic-blog'
import { fetchClaudeBlog } from './sources/claude-blog'
import { fetchGitHubReleases } from './sources/github-releases'
import { fetchHackerNews } from './sources/hackernews'
import { fetchReleasebot } from './sources/releasebot'
import { fetchXRssHub } from './sources/x-rsshub'
import { insertItems } from './db'
import { generateSummary } from './ai-summary'
import type { RawFeedItem } from '../types'

const SOURCES = [
  { name: 'anthropic_blog', fn: fetchAnthropicBlog },
  { name: 'claude_blog', fn: fetchClaudeBlog },
  { name: 'github_releases', fn: fetchGitHubReleases },
  { name: 'hackernews', fn: fetchHackerNews },
  { name: 'releasebot', fn: fetchReleasebot },
  { name: 'x_twitter', fn: fetchXRssHub },
]

export async function runSync(): Promise<{
  inserted: number
  skipped: number
  errors: string[]
}> {
  const results = await Promise.allSettled(SOURCES.map(({ fn }) => fn()))
  const allItems: RawFeedItem[] = []
  const errors: string[] = []

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value)
    } else {
      errors.push(`${SOURCES[i].name}: ${result.reason?.message ?? 'unknown error'}`)
    }
  })

  // Generate AI summaries in parallel for all fetched items.
  // generateSummary never throws — failures silently fall back to null.
  const summarised = await Promise.all(
    allItems.map(async (item) => ({
      ...item,
      summary: await generateSummary(item.title, item.summary),
    }))
  )

  const inserted = summarised.length > 0 ? await insertItems(summarised) : 0
  const skipped = summarised.length - inserted

  return { inserted, skipped, errors }
}
