import { NextResponse } from 'next/server'
import { getItemsSince } from '@/features/updates/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const since = searchParams.get('since')

  if (!since) {
    return NextResponse.json({ error: 'invalid_since' }, { status: 400 })
  }

  const sinceDate = new Date(since)
  if (isNaN(sinceDate.getTime())) {
    return NextResponse.json({ error: 'invalid_since' }, { status: 400 })
  }

  if (sinceDate > new Date()) {
    return NextResponse.json({ items: [], count: 0 })
  }

  const rows = await getItemsSince(sinceDate)
  const items = rows.map((row) => ({
    ...row,
    publishedAt: row.publishedAt.toISOString(),
    fetchedAt: row.fetchedAt.toISOString(),
  }))

  return NextResponse.json({ items, count: items.length })
}
