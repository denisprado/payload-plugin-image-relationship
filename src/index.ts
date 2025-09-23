import type { Config, Plugin } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Configuration as WebpackConfig } from 'webpack'
import type { ImageRelationshipOptions } from './types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
      admin: {
        ...(incomingConfig.admin || {}),
        // @ts-expect-error
        webpack: (webpackConfig: WebpackConfig): WebpackConfig => {
          const newConfig: WebpackConfig = {
            ...webpackConfig,
            resolve: {
              ...webpackConfig.resolve,
              alias: {
                ...(webpackConfig.resolve?.alias || {}),
                'payload-plugin-image-relationship/components/Component': path.resolve(
                  __dirname,
                  './components/Component.js',
                ),
              },
            },
          }
          return newConfig
        },
      },
    }

    return config
  }