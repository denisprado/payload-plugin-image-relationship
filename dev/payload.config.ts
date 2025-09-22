import { BaseDatabaseAdapter, buildConfig, Payload } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { imageRelationshipPlugin } from '../src/index.js' // Adicionado .js
import { Users } from './collections/Users.js' // Adicionado .js
import { Media } from './collections/Media.js' // Adicionado .js
import { Posts } from './collections/Posts.js' // Adicionado .js

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  serverURL: 'http://localhost:3000',
  admin: {
    user: Users.slug,
  },
  plugins: [imageRelationshipPlugin()],
  collections: [Users, Media, Posts],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  db: {
    allowIDOnCreate: undefined,
    defaultIDType: 'number',
    init: function (args: { payload: Payload }): BaseDatabaseAdapter {
      throw new Error('Function not implemented.')
    },
    name: undefined,
  },
  secret: '',
})
