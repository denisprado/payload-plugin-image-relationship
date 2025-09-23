import type { Config, Plugin } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import type { ImageRelationshipOptions } from './types.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const imageRelationshipPlugin =
  (pluginOptions: ImageRelationshipOptions): Plugin =>
  (incomingConfig): Config => {
    const { enabled, relationTo } = pluginOptions

    if (!enabled || !relationTo) {
      return incomingConfig
    }

    const relationToSet = new Set(Array.isArray(relationTo) ? relationTo : [relationTo])

    const config: Config = {
      ...incomingConfig,
      collections: incomingConfig.collections?.map((collection) => {
        const newFields = collection.fields.map((field) => {
          if (field.type === 'relationship') {
            const fieldRelationTo = Array.isArray(field.relationTo)
              ? field.relationTo
              : [field.relationTo]
            const match = fieldRelationTo.some((slug) => relationToSet.has(slug))

            if (match) {
              return {
                ...field,
                admin: {
                  ...(field.admin || {}),
                  components: {
                    ...(field.admin?.components || {}),
                    Field: path.resolve(dirname, './components/Component.js'),
                  },
                },
              } as any // eslint-disable-line @typescript-eslint/no-explicit-any
            }
          }
          return field
        })

        return {
          ...collection,
          fields: newFields,
        }
      }),
    }

    return config
  }
