import { prisma } from '@/lib/prisma'

// One-time endpoint: delete category/noise items from DB. Remove after use.
export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }
  const result = await prisma.feedItem.deleteMany({
    where: {
      OR: [
        { title: { contains: 'Category' } },
        { title: { contains: 'Login -' } },
        { title: { contains: 'Jobs -' } },
        { title: { endsWith: '- Jobs' } },
      ],
    },
  })
  return Response.json({ deleted: result.count })
}
