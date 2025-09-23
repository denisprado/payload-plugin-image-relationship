import type { Config, Plugin } from 'payload'
import type { ImageRelationshipOptions } from './types.js'

export const imageRelationshipPlugin =
  (pluginOptions: ImageRelationshipOptions): Plugin =>
  (incomingConfig): Config => {
    const { enabled = true, relationTo } = pluginOptions

    if (!enabled) {
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
              field.admin = {
                ...(field.admin || {}),
                components: {
                  ...(field.admin?.components || {}),
                  Field: 'payload-plugin-image-relationship/components/Component',
                },
              }
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
