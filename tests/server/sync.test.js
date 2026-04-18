/**
 * Unit tests for server/api/notes/sync.post.js
 *
 * Focuses on encryption-related behavior: opaque field storage,
 * tags handling (string vs array), hard delete with tombstones, and pull responses.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockQuery = vi.fn()
const mockRequireAuth = vi.fn()
const mockNotifySync = vi.fn()

vi.mock('../../server/utils/db.js', () => ({ query: (...args) => mockQuery(...args) }))
vi.mock('../../server/utils/auth.js', () => ({
  requireAuth: (...args) => mockRequireAuth(...args),
}))
vi.mock('../../server/utils/syncBroadcast.js', () => ({
  notifySync: (...args) => mockNotifySync(...args),
}))

globalThis.defineEventHandler = (handler) => handler
globalThis.readBody = vi.fn()
globalThis.createError = (opts) => {
  const err = new Error(opts.statusMessage)
  err.statusCode = opts.statusCode
  return err
}

const handler = (await import('../../server/api/notes/sync.post.js')).default

beforeEach(() => {
  vi.clearAllMocks()
  mockRequireAuth.mockResolvedValue({ userId: 1 })
})

describe('POST /api/notes/sync', () => {
  it('stores encrypted string tags as-is', async () => {
    const encryptedTags = '{"iv":"abc","ct":"def"}'
    readBody.mockResolvedValue({
      notes: [
        {
          clientId: 'n1',
          title: '{"iv":"t","ct":"t"}',
          description: '',
          tags: encryptedTags,
          content: '{"iv":"c","ct":"c"}',
          sortOrder: 0,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
      deletedClientIds: [],
    })

    // 1. Check tombstone for n1
    mockQuery.mockResolvedValueOnce({ rows: [] })
    // 2. INSERT/UPSERT
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          client_id: 'n1',
          title: '{"iv":"t","ct":"t"}',
          description: '',
          tags: encryptedTags,
          content: '{"iv":"c","ct":"c"}',
          sort_order: 0,
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ],
    })
    // 3. Check server-deleted IDs
    mockQuery.mockResolvedValueOnce({ rows: [] })
    // 4. Pull all notes
    mockQuery.mockResolvedValueOnce({ rows: [] })
    // 5. SELECT welcome_created
    mockQuery.mockResolvedValueOnce({ rows: [{ welcome_created: false }] })
    // 6. Tombstone purge
    mockQuery.mockResolvedValueOnce({ rows: [] })

    await handler({})

    // The INSERT call (2nd query) should have the encrypted tags string directly
    const insertCall = mockQuery.mock.calls[1]
    expect(insertCall[1][4]).toBe(encryptedTags) // tags param
  })

  it('JSON.stringifies array tags (legacy)', async () => {
    readBody.mockResolvedValue({
      notes: [
        {
          clientId: 'n1',
          title: 'Plain Title',
          tags: ['tag1', 'tag2'],
          content: 'plain content',
          sortOrder: 0,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
      deletedClientIds: [],
    })

    mockQuery.mockResolvedValueOnce({ rows: [] }) // check tombstone
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          client_id: 'n1',
          title: 'Plain Title',
          description: '',
          tags: '["tag1","tag2"]',
          content: 'plain content',
          sort_order: 0,
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ],
    })
    mockQuery.mockResolvedValueOnce({ rows: [] }) // server-deleted IDs
    mockQuery.mockResolvedValueOnce({ rows: [] }) // pull
    mockQuery.mockResolvedValueOnce({ rows: [{ welcome_created: false }] }) // welcome_created
    mockQuery.mockResolvedValueOnce({ rows: [] }) // tombstone purge

    await handler({})

    const insertCall = mockQuery.mock.calls[1]
    expect(insertCall[1][4]).toBe('["tag1","tag2"]')
  })

  it('hard-deletes notes and records tombstones', async () => {
    readBody.mockResolvedValue({
      notes: [],
      deletedClientIds: ['n1', 'n2'],
    })

    // 1. DELETE FROM notes
    mockQuery.mockResolvedValueOnce({ rows: [] })
    // 2. INSERT tombstone for n1
    mockQuery.mockResolvedValueOnce({ rows: [] })
    // 3. INSERT tombstone for n2
    mockQuery.mockResolvedValueOnce({ rows: [] })
    // 4. Pull query
    mockQuery.mockResolvedValueOnce({ rows: [] })
    // 5. SELECT welcome_created
    mockQuery.mockResolvedValueOnce({ rows: [{ welcome_created: false }] })
    // 6. Tombstone purge
    mockQuery.mockResolvedValueOnce({ rows: [] })

    await handler({})

    // First query is the hard DELETE
    expect(mockQuery.mock.calls[0][0]).toContain('DELETE FROM notes')
    expect(mockQuery.mock.calls[0][1]).toEqual([1, ['n1', 'n2']])
    // Tombstone inserts
    expect(mockQuery.mock.calls[1][0]).toContain('INSERT INTO deleted_notes')
    expect(mockQuery.mock.calls[2][0]).toContain('INSERT INTO deleted_notes')
  })

  it('skips notes that have a tombstone on server', async () => {
    readBody.mockResolvedValue({
      notes: [
        {
          clientId: 'n1',
          title: 'title',
          content: 'content',
          sortOrder: 0,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
      deletedClientIds: [],
    })

    // 1. Check tombstone: exists
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] })
    // 2. Check server-deleted IDs
    mockQuery.mockResolvedValueOnce({ rows: [{ client_id: 'n1' }] })
    // 3. Pull query
    mockQuery.mockResolvedValueOnce({ rows: [] })
    // 4. SELECT welcome_created
    mockQuery.mockResolvedValueOnce({ rows: [{ welcome_created: false }] })
    // 5. Tombstone purge
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const result = await handler({})

    expect(result.pushed).toEqual([])
  })

  it('returns pulled notes with encrypted fields intact', async () => {
    readBody.mockResolvedValue({ notes: [], deletedClientIds: [] })

    // Pull query
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          client_id: 'n1',
          title: '{"iv":"a","ct":"b"}',
          description: '{"iv":"c","ct":"d"}',
          tags: '{"iv":"e","ct":"f"}',
          content: '{"iv":"g","ct":"h"}',
          sort_order: 0,
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ],
    })
    // SELECT welcome_created
    mockQuery.mockResolvedValueOnce({ rows: [{ welcome_created: false }] })
    // Tombstone purge
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const result = await handler({})

    expect(result.pulled).toHaveLength(1)
    expect(result.pulled[0].title).toBe('{"iv":"a","ct":"b"}')
    expect(result.pulled[0].tags).toBe('{"iv":"e","ct":"f"}')
  })

  it('notifies other clients via SSE broadcast', async () => {
    readBody.mockResolvedValue({
      notes: [],
      deletedClientIds: [],
      sessionId: 'sess-1',
      broadcast: true,
    })
    mockQuery.mockResolvedValueOnce({ rows: [] }) // pull
    mockQuery.mockResolvedValueOnce({ rows: [{ welcome_created: false }] }) // welcome_created
    mockQuery.mockResolvedValueOnce({ rows: [] }) // tombstone purge

    await handler({})

    expect(mockNotifySync).toHaveBeenCalledWith(1, 'sess-1')
  })

  it('skips broadcast when broadcast=false', async () => {
    readBody.mockResolvedValue({
      notes: [],
      deletedClientIds: [],
      broadcast: false,
    })
    mockQuery.mockResolvedValueOnce({ rows: [] }) // pull
    mockQuery.mockResolvedValueOnce({ rows: [{ welcome_created: false }] }) // welcome_created
    mockQuery.mockResolvedValueOnce({ rows: [] }) // tombstone purge

    await handler({})

    expect(mockNotifySync).not.toHaveBeenCalled()
  })

  it('reports server-deleted client IDs via tombstones', async () => {
    readBody.mockResolvedValue({
      notes: [
        {
          clientId: 'n1',
          title: 't',
          content: 'c',
          sortOrder: 0,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
      deletedClientIds: [],
    })

    // 1. Check tombstone for n1: not deleted
    mockQuery.mockResolvedValueOnce({ rows: [] })
    // 2. INSERT
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          client_id: 'n1',
          title: 't',
          description: '',
          tags: '[]',
          content: 'c',
          sort_order: 0,
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ],
    })
    // 3. Check which client IDs are tombstoned
    mockQuery.mockResolvedValueOnce({ rows: [{ client_id: 'n1' }] })
    // 4. Pull
    mockQuery.mockResolvedValueOnce({ rows: [] })
    // 5. SELECT welcome_created
    mockQuery.mockResolvedValueOnce({ rows: [{ welcome_created: false }] })
    // 6. Tombstone purge
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const result = await handler({})
    expect(result.deletedClientIds).toEqual(['n1'])
  })
})
