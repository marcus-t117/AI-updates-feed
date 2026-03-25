import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/features/updates/lib/db', () => ({ deleteOldItems: vi.fn() }))

import { deleteOldItems } from '@/features/updates/lib/db'
import { POST } from '@/app/api/updates/cleanup/route'

process.env.CRON_SECRET = 'test-secret'

const makeReq = (auth?: string) =>
  new Request('http://localhost/api/updates/cleanup', {
    method: 'POST',
    headers: auth ? { Authorization: auth } : {},
  })

beforeEach(() => vi.clearAllMocks())

describe('POST /api/updates/cleanup', () => {
  it('returns 401 without valid secret', async () => {
    const res = await POST(makeReq())
    expect(res.status).toBe(401)
    expect(deleteOldItems).not.toHaveBeenCalled()
  })

  it('calls deleteOldItems and returns deleted count', async () => {
    vi.mocked(deleteOldItems).mockResolvedValue(12)
    const res = await POST(makeReq('Bearer test-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ deleted: 12 })
  })
})
