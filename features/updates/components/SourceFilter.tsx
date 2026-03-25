'use client'

import type { Source } from '../types'
import { SOURCE_LABELS } from '../types'

const ALL_SOURCES: Source[] = ['anthropic_blog', 'claude_blog', 'github_releases', 'x_twitter', 'hackernews', 'releasebot']

export function SourceFilter({
  active,
  onChange,
}: {
  active: Source | null
  onChange: (source: Source | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
          active === null
            ? 'bg-[#c8102e] text-white'
            : 'bg-[#252525] text-[#7a7a7a] hover:text-[#f0f0f0] border border-[#2e2e2e]'
        }`}
      >
        All
      </button>
      {ALL_SOURCES.map((source) => (
        <button
          key={source}
          onClick={() => onChange(source)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            active === source
              ? 'bg-[#c8102e] text-white'
              : 'bg-[#252525] text-[#7a7a7a] hover:text-[#f0f0f0] border border-[#2e2e2e]'
          }`}
        >
          {SOURCE_LABELS[source]}
        </button>
      ))}
    </div>
  )
}
