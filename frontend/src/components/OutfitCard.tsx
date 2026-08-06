import { useState, useEffect } from 'react'
import type { Outfit } from '../api/outfits.ts'
import { fetchItemImageUrl } from '../api/outfits.ts'

interface OutfitCardProps {
  outfit: Outfit
  onDelete: (id: number) => void
}

function OutfitCard({ outfit, onDelete }: OutfitCardProps) {
  const [imageUrls, setImageUrls] = useState<Map<number, string>>(new Map())
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const map = new Map<number, string>()
      const results = await Promise.allSettled(
        outfit.items.slice(0, 4).map(async (item) => {
          try {
            return { id: item.id, url: await fetchItemImageUrl(item.id) }
          } catch {
            return null
          }
        }),
      )
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) {
          map.set(r.value.id, r.value.url)
        }
      }
      if (!cancelled) setImageUrls(map)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [outfit.items])

  const date = new Date(outfit.created_at).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDelete(outfit.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="bg-bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-border-accent hover:shadow-lg group">
      <div className="p-3 flex gap-2 min-h-[72px] items-start">
        <div className="flex gap-1.5 flex-shrink-0">
          {outfit.items.length === 0 ? (
            <div className="w-10 h-10 rounded bg-bg-elevated flex items-center justify-center text-fg-muted text-xs">
              —
            </div>
          ) : (
            outfit.items.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="w-10 h-10 rounded overflow-hidden bg-bg-elevated flex-shrink-0 border border-border"
              >
                {imageUrls.has(item.id) ? (
                  <img
                    src={imageUrls.get(item.id)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-fg-muted text-[8px]">
                    {item.name.charAt(0)}
                  </div>
                )}
              </div>
            ))
          )}
          {outfit.items.length > 4 && (
            <div className="w-10 h-10 rounded bg-bg-hover flex items-center justify-center text-fg-muted text-xs flex-shrink-0">
              +{outfit.items.length - 4}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-fg text-base font-bold truncate">
            {outfit.name}
          </h3>
          <p className="text-fg-muted text-xs mt-0.5">{date}</p>
          <p className="text-fg-muted text-xs">{outfit.items.length} Teile</p>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-danger hover:text-white hover:bg-danger transition-colors duration-200 rounded-md p-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={`Outfit "${outfit.name}" löschen`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default OutfitCard
