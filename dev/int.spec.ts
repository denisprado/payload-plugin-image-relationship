import type { Payload } from 'payload'

import config from '@payload-config'
import { getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import type { Media, Post } from './payload-types.js'
import { MongoMemoryServer } from 'mongodb-memory-server'

let payload: Payload
let mediaDoc: Media
let mongo: MongoMemoryServer

beforeAll(async () => {
  mongo = await MongoMemoryServer.create()
  process.env.DATABASE_URI = mongo.getUri()
  process.env.PAYLOAD_SECRET = 'bb4a6482db6994d6c91b3e6d6427080e408f9d687b5c22cfcbc2addadc8d6fcd';
  payload = await getPayload({ config, secret: 'bb4a6482db6994d6c91b3e6d6427080e408f9d687b5c22cfcbc2addadc8d6fcd' })

  // The 'data' object is cast to 'any' as a temporary workaround.
  // This is likely needed because the generated 'payload-types.ts' is out of sync.
  // To fix this, run: pnpm generate:types
  mediaDoc = await payload.create({
    collection: 'media',
    data: {
      alt: 'Test Image',
    } as any,
  })
})

describe('Image Relationship Plugin', () => {
  test('should save relationship correctly', async () => {
    const post = await payload.create({
      collection: 'posts',
      // Note: Using 'as any' because generated types may be out of sync
      data: {
        title: 'Test Post',
        featuredImage: mediaDoc.id,
      } as any,
    })

    expect(post).toBeDefined()
    expect(post.id).toBeDefined()

    const foundPost: Post = await payload.findByID({
      collection: 'posts',
      id: post.id,
    })

    // @ts-ignore - This property may not exist on the 'Post' type if it's stale.
    expect(foundPost.featuredImage).toBe(mediaDoc.id)
  })

  test('should fail if required relationship is missing', async () => {
    await expect(
      payload.create({
        collection: 'posts',
        // Note: Using 'as any' because generated types may be out of sync
        data: {
          title: 'Another Test Post',
        } as any,
      }),
    ).rejects.toThrow()
  })

  afterAll(async () => {
    const { docs } = await payload.find({ collection: 'posts', limit: 100 })
    // Add explicit type for 'doc' to avoid implicit any
    const postIds = docs.map((doc: Partial<Post>) => doc.id)

    await Promise.all([
      // Add explicit type for 'id' to avoid implicit any
      ...postIds.map((id: string | undefined) => payload.delete({ collection: 'posts', id: id! })),
      payload.delete({ collection: 'media', id: mediaDoc.id }),
    ])
  })
})
