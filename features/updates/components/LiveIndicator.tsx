'use client'

import { useEffect, useState } from 'react'

export function LiveIndicator({ pulse }: { pulse: boolean }) {
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (!pulse) return
    setAnimating(true)
    const timer = setTimeout(() => setAnimating(false), 2000)
    return () => clearTimeout(timer)
  }, [pulse])

  return (
    <span className="relative flex h-2 w-2">
      {animating && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c8102e] opacity-75" />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${animating ? 'bg-[#c8102e]' : 'bg-[#4a4a4a]'}`} />
    </span>
  )
}
