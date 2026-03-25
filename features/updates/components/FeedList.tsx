'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { FeedItem as FeedItemType, Source } from '../types'
import { FeedItem } from './FeedItem'
import { SourceFilter } from './SourceFilter'
import { LiveIndicator } from './LiveIndicator'

export function FeedList({ initialItems }: { initialItems: FeedItemType[] }) {
  const [items, setItems] = useState<FeedItemType[]>(initialItems)
  const [activeSource, setActiveSource] = useState<Source | null>(null)
  const [pulse, setPulse] = useState(false)
  // useRef so poll reads latest value without restarting the interval on every update
  const lastSeenRef = useRef<string>(new Date().toISOString())

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/updates/latest?since=${encodeURIComponent(lastSeenRef.current)}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.count > 0) {
        setItems((prev) => [...data.items, ...prev])
        lastSeenRef.current = data.items[0].publishedAt
        setPulse(true)
        setTimeout(() => setPulse(false), 2100)
      }
    } catch {
      // silently ignore poll errors
    }
  }, []) // stable — reads lastSeen via ref, not closure

  useEffect(() => {
    const interval = setInterval(poll, 60_000)
    return () => clearInterval(interval)
  }, [poll])

  const filtered = activeSource
    ? items.filter((i) => i.source === activeSource)
    : items

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#f0f0f0] flex items-center gap-2">
          Claude Updates
          <LiveIndicator pulse={pulse} />
        </h1>
      </div>
      <div className="mb-6">
        <SourceFilter active={activeSource} onChange={setActiveSource} />
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map((item) => (
          <FeedItem key={item.id} item={item} />
        ))}
        {filtered.length === 0 && (
          <p className="text-[#7a7a7a] text-sm">No items yet.</p>
        )}
      </div>
      <footer className="mt-10 pt-6 border-t border-[#2e2e2e]">
        <a
          href="/api/updates/feed.xml"
          className="text-sm text-[#7a7a7a] hover:text-[#f0f0f0] transition-colors"
        >
          Subscribe via RSS
        </a>
      </footer>
    </div>
  )
}
