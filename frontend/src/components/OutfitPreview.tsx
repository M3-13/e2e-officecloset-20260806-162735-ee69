import { useState, useEffect, useCallback } from 'react'
import type { ClothingItem } from '../api/outfits.ts'
import { fetchItemImageUrl } from '../api/outfits.ts'

const CATEGORY_ORDER: Record<string, number> = {
  Oberteil: 0,
  Hose: 1,
  Schuhe: 2,
  Accessoire: 3,
  Jacke: 4,
  Kleid: 5,
}

interface ItemWithImage extends ClothingItem {
  imageUrl?: string
}

interface OutfitPreviewProps {
  items: ClothingItem[]
}

function OutfitPreview({ items }: OutfitPreviewProps) {
  const [loadedItems, setLoadedItems] = useState<ItemWithImage[]>([])

  const loadImages = useCallback(async () => {
    const result: ItemWithImage[] = await Promise.all(
      items.map(async (item) => {
        try {
          const url = await fetchItemImageUrl(item.id)
          return { ...item, imageUrl: url }
        } catch {
          return item
        }
      }),
    )
    setLoadedItems(result)
  }, [items])

  useEffect(() => {
    if (items.length === 0) {
      setLoadedItems([])
      return
    }
    loadImages()
  }, [items, loadImages])

  const sorted = [...loadedItems].sort((a, b) => {
    const orderA = CATEGORY_ORDER[a.category] ?? 99
    const orderB = CATEGORY_ORDER[b.category] ?? 99
    return orderA - orderB
  })

  const hasOberteil = sorted.some(
    (i) => i.category.toLowerCase() === 'oberteil',
  )
  const schuhe = sorted.filter((i) => i.category.toLowerCase() === 'schuhe')

  return (
    <div
      className="relative w-full rounded-xl border border-dashed border-border-accent p-6 md:p-8 flex flex-col items-center justify-center min-h-[400px] overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(212,168,67,0.10) 0%, transparent 70%)',
      }}
    >
      {loadedItems.length === 0 ? (
        <p className="text-fg-muted italic font-heading text-lg text-center select-none">
          Klicke auf Kleidungsstücke, um dein Outfit zu gestalten.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-3 w-full">
          {sorted.map((item) => (
            <div
              key={item.id}
              className="relative rounded-lg overflow-hidden border-2 border-accent shadow-lg"
              style={{
                boxShadow: '0 4px 24px rgba(212,168,67,0.25)',
                width: item.category.toLowerCase() === 'accessoire' ? 100 : 160,
                height: item.category.toLowerCase() === 'accessoire' ? 100 : 160,
              }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-bg-card flex items-center justify-center text-fg-muted text-sm">
                  {item.name}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <p className="text-fg text-xs truncate">{item.name}</p>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {!hasOberteil && loadedItems.length > 0 && (
              <span className="text-xs bg-danger/20 text-danger px-3 py-1 rounded-pill">
                Kein Oberteil ausgewählt
              </span>
            )}
            {schuhe.length > 1 && (
              <span className="text-xs bg-accent-soft text-accent px-3 py-1 rounded-pill">
                Mehrere Schuhe ausgewählt
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-1">
            {sorted.map((item) => (
              <span
                key={`cat-${item.id}`}
                className="text-xs bg-bg-card text-fg-muted px-2 py-0.5 rounded-pill border border-border"
              >
                {item.category}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default OutfitPreview
