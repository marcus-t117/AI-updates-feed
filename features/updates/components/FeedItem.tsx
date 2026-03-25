import type { FeedItem as FeedItemType, Source } from '../types'
import { SOURCE_LABELS, stripHtml } from '../types'

const BADGE_COLOURS: Record<Source, string> = {
  anthropic_blog: 'bg-[#c8102e] text-white',
  claude_blog: 'bg-[#e8684a] text-white',
  github_releases: 'bg-[#4a9eff] text-white',
  hackernews: 'bg-[#ff6600] text-white',
  x_twitter: 'bg-[#888888] text-white',
  releasebot: 'bg-[#7c3aed] text-white',
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function FeedItem({ item }: { item: FeedItemType }) {
  const source = item.source as Source
  return (
    <article className="rounded-lg border border-[#2e2e2e] bg-[#252525] p-4 hover:border-[#3a3a3a] transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${BADGE_COLOURS[source]}`}>
          {SOURCE_LABELS[source]}
        </span>
        <span className="text-xs text-[#7a7a7a]">{relativeTime(item.publishedAt)}</span>
        {item.author && (
          <span className="text-xs text-[#7a7a7a]">{item.author}</span>
        )}
      </div>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#f0f0f0] font-medium hover:text-[#c8102e] transition-colors line-clamp-2"
      >
        {item.title}
      </a>
      {item.summary && (
        <p className="mt-1 text-sm text-[#7a7a7a] line-clamp-2">{stripHtml(item.summary)}</p>
      )}
    </article>
  )
}
