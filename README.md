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

In your `payload.config.ts`, import the plugin and add it to the `plugins` array. You must enable the plugin and specify which collection(s) it should apply to.

```ts
import { buildConfig } from 'payload'
import { imageRelationshipPlugin } from 'payload-plugin-image-relationship'

export default buildConfig({
  // ...
  plugins: [
    imageRelationshipPlugin({
      enabled: true,
      // Can be a single slug or an array of slugs
      relationTo: 'media', 
    }),
  ],
})
```

The plugin works by programmatically finding all `relationship` fields that point to the collection(s) you specified in the `relationTo` option, and replacing their default component with a visual image selector.

This approach ensures that only the intended relationship fields are affected.

**Important:** The collections you target with `relationTo` should have `upload` enabled.

## Compatibility

*   Payload CMS: `^3.0.0`

## License

[MIT](LICENSE)