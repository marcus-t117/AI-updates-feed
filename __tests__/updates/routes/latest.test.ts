import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/features/updates/lib/db', () => ({ getItemsSince: vi.fn() }))

import { getItemsSince } from '@/features/updates/lib/db'
import { GET } from '@/app/api/updates/latest/route'

const mockItem = {
  id: 'uuid-1',
  url: 'https://a.com',
  title: 'Test',
  summary: null,
  source: 'anthropic_blog',
  author: null,
  publishedAt: new Date('2026-01-10'),
  fetchedAt: new Date('2026-01-10'),
}

const makeReq = (since?: string) =>
  new Request(`http://localhost/api/updates/latest${since ? `?since=${since}` : ''}`)

beforeEach(() => vi.clearAllMocks())

describe('GET /api/updates/latest', () => {
  it('returns 400 if since is missing', async () => {
    const res = await GET(makeReq())
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('invalid_since')
  })

  it('returns 400 if since is not a valid ISO timestamp', async () => {
    const res = await GET(makeReq('not-a-date'))
    expect(res.status).toBe(400)
  })

  it('returns 200 with empty items if since is in the future', async () => {
    const future = new Date(Date.now() + 60_000).toISOString()
    const res = await GET(makeReq(future))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ items: [], count: 0 })
    expect(getItemsSince).not.toHaveBeenCalled()
  })

  it('returns items since the given timestamp', async () => {
    vi.mocked(getItemsSince).mockResolvedValue([mockItem] as any)
    const res = await GET(makeReq('2026-01-01T00:00:00.000Z'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.count).toBe(1)
    expect(body.items[0].url).toBe('https://a.com')
  })
})
