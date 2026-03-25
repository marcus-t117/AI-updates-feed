import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/features/updates/lib/sync', () => ({ runSync: vi.fn() }))

import { runSync } from '@/features/updates/lib/sync'
import { POST } from '@/app/api/updates/sync/route'

process.env.CRON_SECRET = 'test-secret'

const makeReq = (authHeader?: string) =>
  new Request('http://localhost/api/updates/sync', {
    method: 'POST',
    headers: authHeader ? { Authorization: authHeader } : {},
  })

beforeEach(() => vi.clearAllMocks())

describe('POST /api/updates/sync', () => {
  it('returns 401 if Authorization header is missing', async () => {
    const res = await POST(makeReq())
    expect(res.status).toBe(401)
    expect(runSync).not.toHaveBeenCalled()
  })

  it('returns 401 if secret is wrong', async () => {
    const res = await POST(makeReq('Bearer wrong-secret'))
    expect(res.status).toBe(401)
  })

  it('calls runSync and returns 200 with counts on valid secret', async () => {
    vi.mocked(runSync).mockResolvedValue({ inserted: 5, skipped: 10, errors: [] })
    const res = await POST(makeReq('Bearer test-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ inserted: 5, skipped: 10, errors: [] })
  })

  it('returns 500 if runSync throws', async () => {
    vi.mocked(runSync).mockRejectedValue(new Error('db error'))
    const res = await POST(makeReq('Bearer test-secret'))
    expect(res.status).toBe(500)
  })
})
