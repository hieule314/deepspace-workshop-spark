import type { CollectionSchema } from 'deepspace/schema'

const ownerReadOnly = { read: 'own', create: false, update: false, delete: false } as const

export const lessonsSchema: CollectionSchema = {
  name: 'lessons',
  columns: [
    { name: 'lesson', storage: 'text', interpretation: { kind: 'json' }, required: true },
  ],
  permissions: {
    viewer: ownerReadOnly,
    member: ownerReadOnly,
    admin: ownerReadOnly,
  },
}

export const generationAttemptsSchema: CollectionSchema = {
  name: 'generationAttempts',
  columns: [
    { name: 'day', storage: 'text', interpretation: 'plain', required: true },
    { name: 'slot', storage: 'number', interpretation: 'plain', required: true },
  ],
  uniqueOn: ['day', 'slot'],
  permissions: {},
}
