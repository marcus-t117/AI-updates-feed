import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// One-time: delete TechCrunch/ProductHunt items incorrectly stored under x_twitter/releasebot
export async function POST(request: Request) {
  const auth = request.headers.get('Authorization')
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const tc = await prisma.feedItem.deleteMany({
    where: { source: 'x_twitter', url: { contains: 'techcrunch.com' } },
  })
  const ph = await prisma.feedItem.deleteMany({
    where: { source: 'releasebot', url: { contains: 'producthunt.com' } },
  })

  return NextResponse.json({ deleted_techcrunch: tc.count, deleted_producthunt: ph.count })
}
