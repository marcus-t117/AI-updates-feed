import { runSync } from '@/features/updates/lib/sync'

export async function POST() {
  const result = await runSync()
  return Response.json(result)
}
