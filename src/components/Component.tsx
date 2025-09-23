'use client'
import React, { useEffect, useState } from 'react'
import { Collapsible, FieldLabel, TextInput, useConfig, useField } from '@payloadcms/ui'
import { RelationshipFieldClientComponent } from 'payload'

const baseClass = 'image-relationship'

type Doc = Record<string, unknown> & {
  id: string
  alt?: string
  filename?: string
  url?: string
  sizes?: {
    thumbnail?: {
      url?: string
    }
  }
}

const ImageRelationship: RelationshipFieldClientComponent = (props) => {
  const { path, field } = props
  const { value, setValue } = useField<string | string[]>({ path })
  const {
    config: { serverURL },
  } = useConfig()
  const [media, setMedia] = useState<Doc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const relationTo = Array.isArray(field.relationTo) ? field.relationTo[0] : field.relationTo

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${serverURL}/api/${relationTo}?limit=2000`)
        if (response.ok) {
          const data = await response.json()
          setMedia(data.docs)
        }
      } catch (error) {
        console.error('Error fetching media:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMedia()
  }, [serverURL, relationTo])

  const handleImageClick = (id: string) => {
    if (field.hasMany) {
      const selected = new Set((value as string[]) || [])
      if (selected.has(id)) {
        selected.delete(id)
      } else {
        selected.add(id)
      }
      setValue(Array.from(selected))
    } else {
      setValue(id)
    }
  }

  const filteredAndSortedMedia = media
    .filter((doc) => {
      const searchText = filter.toLowerCase()
      const altText = doc.alt?.toLowerCase() || ''
      const filename = doc.filename?.toLowerCase() || ''
      return altText.includes(searchText) || filename.includes(searchText)
    })
    .sort((a, b) => {
      const aIsSelected = field.hasMany ? (value as string[])?.includes(a.id) : value === a.id
      const bIsSelected = field.hasMany ? (value as string[])?.includes(b.id) : value === b.id

      if (aIsSelected && !bIsSelected) {
        return -1
      }
      if (!aIsSelected && bIsSelected) {
        return 1
      }
      return 0
    })

  const selectedMedia = media.filter((doc) => {
    if (field.hasMany) {
      return (value as string[])?.includes(doc.id)
    }
    return value === doc.id
  })

  if (isLoading) {
    return (
      <div className={baseClass}>
        <FieldLabel label={field.label} />
        <div>Loading media...</div>
      </div>
    )
  }

  return (
    <div className={baseClass}>
      <style>
        {`
          .${baseClass}__header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 0px;
          }
          .${baseClass}__selected-media {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 10px;
						margin-bottom: 20px;
          }
          .${baseClass}__selected-thumbnail {
            position: relative;
            width: 40px;
            height: 40px;
          }
          .${baseClass}__selected-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 3px;
          }
          .${baseClass}__gallery {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid var(--theme-elevation-300);
            padding: 10px;
            border-radius: 5px;
            background-color: var(--theme-elevation-50);
          }
          .${baseClass}__thumbnail-item {
            position: relative;
            cursor: pointer;
            border: 3px solid transparent;
            border-radius: 5px;
            width: 150px;
            height: 150px;
          }
          .${baseClass}__thumbnail-item--is-selected {
            border-color: var(--theme-primary-500);
          }
          .${baseClass}__thumbnail-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            border-radius: 2px;
          }
          .${baseClass}__selected-check {
            position: absolute;
            top: 5px;
            right: 5px;
            background-color: var(--theme-primary-500);
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
          }
        `}
      </style>
      <FieldLabel label={field.label} />
      <Collapsible
        header={
          <div className={`${baseClass}__header`}>
            <span>
              {selectedMedia.length === 0 ? 'nenhuma ' : selectedMedia.length} mídia
              {selectedMedia.length > 1 ? 's' : ''} selecionada
              {selectedMedia.length > 1 ? 's' : ''}
            </span>
          </div>
        }
        initCollapsed={true}
      >
        <TextInput
          path="search-media"
          placeholder="Search media..."
          value={filter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
        />
        <div className={`${baseClass}__gallery`}>
          {filteredAndSortedMedia.map((doc) => {
            const isSelected =
              (field.hasMany && (value as string[])?.includes(doc.id)) || value === doc.id
            const thumbnailUrl = doc.sizes?.thumbnail?.url || doc.url
            const fullThumbnailUrl = thumbnailUrl ? `${serverURL}${thumbnailUrl}` : undefined

            return (
              <div
                key={doc.id}
                className={`${baseClass}__thumbnail-item ${
                  isSelected ? `${baseClass}__thumbnail-item--is-selected` : ''
                }`}
                onClick={() => handleImageClick(doc.id)}
              >
                {fullThumbnailUrl && <img src={fullThumbnailUrl} alt={doc.alt || 'media'} />}
                {isSelected && <div className={`${baseClass}__selected-check`}>✔</div>}
              </div>
            )
          })}
        </div>
      </Collapsible>
      <div className={`${baseClass}__selected-media`}>
        {selectedMedia.map((doc) => {
          const thumbnailUrl = doc.sizes?.thumbnail?.url || doc.url
          const fullThumbnailUrl = thumbnailUrl ? `${serverURL}${thumbnailUrl}` : undefined
          return (
            <div key={doc.id} className={`${baseClass}__selected-thumbnail`}>
              {fullThumbnailUrl && <img src={fullThumbnailUrl} alt={doc.alt || 'media'} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ImageRelationship
