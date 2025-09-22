import { CollectionConfig } from 'payload/types'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'featuredImage',
      label: 'Featured Image',
      type: 'relationship', // Este campo usará seu componente customizado
      relationTo: 'media', // Relacionado à coleção Media
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({}),
    },
  ],
}