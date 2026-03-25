import { NextResponse } from 'next/server'
import { runSync } from '@/features/updates/lib/sync'

export async function POST(request: Request) {
  const auth = request.headers.get('Authorization')
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const result = await runSync()
    return NextResponse.json(result)
  } catch (err) {
    console.error('[sync] error:', err)
    return NextResponse.json({ error: 'sync failed' }, { status: 500 })
  }
}
