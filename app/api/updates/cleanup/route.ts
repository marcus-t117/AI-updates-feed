import { NextResponse } from 'next/server'
import { deleteOldItems } from '@/features/updates/lib/db'

export async function POST(request: Request) {
  const auth = request.headers.get('Authorization')
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const deleted = await deleteOldItems()
  return NextResponse.json({ deleted })
}
