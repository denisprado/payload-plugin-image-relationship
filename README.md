# Payload Plugin: Image Relationship

[![NPM version](https://img.shields.io/npm/v/payload-plugin-image-relationship.svg)](https://www.npmjs.com/package/payload-plugin-image-relationship)

A plugin for [Payload CMS](https://payloadcms.com) to enhance the relationship field with a visual image selector.

![Image Relationship Plugin Screenshot](https://raw.githubusercontent.com/forigo/payload-plugin-image-relationship/main/screenshot.png)
*(TODO: Add a real screenshot)*

## Features

*   Replaces the default relationship field with a visual, gallery-style interface.
*   Displays image thumbnails for easy selection.
*   Supports both `hasMany: false` (single selection) and `hasMany: true` (multiple selections).
*   Search functionality to filter images by `alt` text or `filename`.
*   Selected images are sorted and displayed first.
*   Collapsible interface to save screen space.
*   Shows a preview of selected images.

## Installation

```bash
npm install payload-plugin-image-relationship
# or
yarn add payload-plugin-image-relationship
```

## How to use

In your `payload.config.ts`, import the plugin and add it to the `plugins` array.

```ts
import { buildConfig } from 'payload'
import { imageRelationshipPlugin } from 'payload-plugin-image-relationship'

export default buildConfig({
  // ...
  plugins: [
    imageRelationshipPlugin(),
  ],
})
```

This plugin works by overriding the default `relationship` field component. To use the visual selector, you need to specify the `custom` components in your relationship field definition.

In your collection where you have a relationship to an `uploads` collection (e.g., `media`), add the `custom` property to the field definition:

```ts
import { relationship } from 'payload-plugin-image-relationship/client'

// ...

const Posts = {
  slug: 'posts',
  fields: [
    {
      name: 'featuredImage',
      type: 'relationship',
      relationTo: 'media', // must be an uploads enabled collection
      custom: {
        components: {
          Field: relationship.Field,
        }
      }
    },
    {
      name: 'gallery',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      custom: {
        components: {
          Field: relationship.Field,
        }
      }
    }
  ]
}
```

**Important:** This plugin is designed for relationship fields that point to a collection with `upload` enabled.

## Compatibility

*   Payload CMS: `^3.0.0`

## License

[MIT](LICENSE)