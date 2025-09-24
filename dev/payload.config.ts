import { BaseDatabaseAdapter, buildConfig, Payload } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { imageRelationshipPlugin } from 'payload-plugin-image-relationship'
import { Users } from './collections/Users.js' // Adicionado .js
import { Media } from './collections/Media.js' // Adicionado .js
import { Posts } from './collections/Posts.js' // Adicionado .js

import { mongooseAdapter } from '@payloadcms/db-mongodb'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  serverURL: 'http://localhost:3000',
  admin: {
    user: Users.slug,
  },
  plugins: [imageRelationshipPlugin({ enabled: true, relationTo: 'media' })],
  collections: [Users, Media, Posts],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
  secret: process.env.PAYLOAD_SECRET,
})
