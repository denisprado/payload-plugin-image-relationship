'use client'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Button,
  Collapsible,
  FieldLabel,
  TextInput,
  useConfig,
  useDocumentDrawer,
  useField,
} from '@payloadcms/ui'
import { RelationshipFieldClientComponent } from 'payload'

const baseClass = 'image-relationship'
const PAGE_SIZE = 30

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

type Doc = Record<string, unknown> & {
  id: string | number
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
  const { value, setValue } = useField<(string | number) | (string | number)[]>({ path })
  const {
    config: { serverURL },
  } = useConfig()

  const [media, setMedia] = useState<Doc[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [forceReload, setForceReload] = useState(0)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)

  const debouncedFilter = useDebounce(filter, 500)

  const relationTo = Array.isArray(field.relationTo) ? field.relationTo[0] : field.relationTo

  const [DocumentDrawer, DocumentDrawerToggler, { closeDrawer }] = useDocumentDrawer({
    collectionSlug: relationTo,
  })

  const fetchMedia = useCallback(
    async (requestedPage: number, currentFilter: string) => {
      setIsFetching(true)
      let url = `${serverURL}/api/${relationTo}?limit=${PAGE_SIZE}&page=${requestedPage}`
      if (currentFilter) {
        const whereQuery = `&where[or][0][alt][like]=${currentFilter}&where[or][1][filename][like]=${currentFilter}`
        url += whereQuery
      }

      try {
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          if (requestedPage === 1) {
            setMedia(data.docs)
          } else {
            setMedia((prev) => [...prev, ...data.docs])
          }
          setPage(requestedPage)
          setHasNextPage(data.hasNextPage)
        }
      } catch (error) {
        console.error('Error fetching media:', error)
      } finally {
        setIsFetching(false)
        setInitialLoading(false)
      }
    },
    [serverURL, relationTo],
  )

  useEffect(() => {
    fetchMedia(1, debouncedFilter)
  }, [debouncedFilter, forceReload, fetchMedia])

  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchMedia(page + 1, debouncedFilter)
    }
  }

  const handleImageClick = (id: string | number) => {
    if (field.hasMany) {
      const selected = new Set((value as (string | number)[]) || [])
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

  const handleSave = useCallback(
    ({ doc }: { doc: Doc }) => {
      if (field.hasMany) {
        setValue([...((value as (string | number)[]) || []), doc.id])
      } else {
        setValue(doc.id)
      }
      setForceReload((v) => v + 1)
      closeDrawer()
    },
    [field.hasMany, setValue, value, closeDrawer],
  )

  const filteredAndSortedMedia = media
    .filter((doc) => {
      const searchText = filter.toLowerCase()
      if (!searchText) return true // If no filter, show all loaded media
      const altText = doc.alt?.toLowerCase() || ''
      const filename = doc.filename?.toLowerCase() || ''
      return altText.includes(searchText) || filename.includes(searchText)
    })
    .sort((a, b) => {
      const aIsSelected = field.hasMany
        ? (value as (string | number)[])?.includes(a.id)
        : value === a.id
      const bIsSelected = field.hasMany
        ? (value as (string | number)[])?.includes(b.id)
        : value === b.id

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
      return (value as (string | number)[])?.includes(doc.id)
    }
    return value === doc.id
  })

  const createFullUrl = (url: string | undefined) => {
    if (!url) return undefined
    try {
      new URL(url) // Throws an error if URL is relative
      return url
    } catch {
      return `${serverURL}${url}`
    }
  }

  if (initialLoading) {
    return (
      <div className={baseClass}>
        <FieldLabel label={field.label as string} />
        <div>Loading media...</div>
      </div>
    )
  }

  return (
    <div className={baseClass}>
      <DocumentDrawer onSave={handleSave} />
      <style>
        {`
          .${baseClass}__header {
            display: flex;
            justify-content: space-between;
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
          .${baseClass}__load-more {
            margin-top: 10px;
            text-align: center;
          }
        `}
      </style>
      <FieldLabel label={field.label as string} />
      <div className={`${baseClass}__selector`}>
        <DocumentDrawerToggler className={`${baseClass}__add-new`}>
          <Button
            aria-label="Add New"
            buttonStyle="icon-label"
            el="div"
            icon="plus"
            iconStyle="with-border"
          >
            {'New Media'}
          </Button>
        </DocumentDrawerToggler>
        <Collapsible
          header={
            <div className={`${baseClass}__header`}>
              <span>
                {selectedMedia.length === 0
                  ? 'no media selected'
                  : `${selectedMedia.length} selected media`}
              </span>

              <DocumentDrawerToggler></DocumentDrawerToggler>
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
                (field.hasMany && (value as (string | number)[])?.includes(doc.id)) ||
                value === doc.id
              const thumbnailUrl = doc.sizes?.thumbnail?.url || doc.url
              const fullThumbnailUrl = createFullUrl(thumbnailUrl)

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
          {hasNextPage && (
            <div className={`${baseClass}__load-more`}>
              <Button onClick={handleLoadMore} disabled={isFetching}>
                {isFetching && page > 1 ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </Collapsible>
      </div>
      <div className={`${baseClass}__selected-media`}>
        {selectedMedia.map((doc) => {
          const thumbnailUrl = doc.sizes?.thumbnail?.url || doc.url
          const fullThumbnailUrl = createFullUrl(thumbnailUrl)
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