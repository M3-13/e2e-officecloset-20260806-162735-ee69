import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ClothingItem } from '../api/outfits.ts'
import { createOutfit, fetchWardrobeItems, fetchItemImageUrl } from '../api/outfits.ts'
import OutfitPreview from '../components/OutfitPreview.tsx'

function OutfitCreatorPage() {
  const navigate = useNavigate()
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [outfitName, setOutfitName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [imageCache, setImageCache] = useState<Map<number, string>>(new Map())

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const items = await fetchWardrobeItems()
        if (!cancelled) setWardrobeItems(items)
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Garderobe konnte nicht geladen werden',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const loadItemImage = useCallback(async (id: number) => {
    if (imageCache.has(id)) return
    try {
      const url = await fetchItemImageUrl(id)
      setImageCache((prev) => {
        const next = new Map(prev)
        next.set(id, url)
        return next
      })
    } catch {
      // silently ignore image load failures
    }
  }, [imageCache])

  useEffect(() => {
    for (const item of wardrobeItems) {
      loadItemImage(item.id)
    }
  }, [wardrobeItems, loadItemImage])

  function toggleItem(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleSave() {
    if (!outfitName.trim()) {
      setError('Bitte gib deinem Outfit einen Namen.')
      return
    }
    if (selectedIds.size === 0) {
      setError('Bitte wähle mindestens ein Kleidungsstück aus.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await createOutfit(outfitName.trim(), Array.from(selectedIds))
      setSuccess('Outfit gespeichert!')
      setOutfitName('')
      setSelectedIds(new Set())
      navigate('/outfits')
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Outfit konnte nicht gespeichert werden',
      )
    } finally {
      setSaving(false)
    }
  }

  const selectedItems = wardrobeItems.filter((item) =>
    selectedIds.has(item.id),
  )

  return (
    <div className="py-6 md:py-12">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-fg mb-2">
          Outfit-Creator
        </h1>
        <p className="text-fg-muted">
          Kombiniere Kleidungsstücke zu deinem perfekten Outfit.
        </p>
      </div>

      {/* Name field + save button */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={outfitName}
          onChange={(e) => setOutfitName(e.target.value)}
          placeholder="Name deines Outfits..."
          className="flex-1 bg-bg-elevated text-fg placeholder-fg-muted border border-border rounded-md px-4 py-3 text-base min-h-[44px] focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(212,168,67,0.2)] transition-colors duration-200"
        />
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-accent text-bg font-semibold px-6 py-3 rounded-md min-h-[44px] transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_4px_20px_rgba(212,168,67,0.45)] hover:-translate-y-px active:bg-[#C49A30] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          {saving ? 'Speichert...' : 'Outfit speichern'}
        </button>
      </div>

      {/* Error / success messages */}
      {error && (
        <div className="mb-4 p-3 bg-danger/10 border-l-2 border-danger text-danger text-sm rounded-r-md">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-success/10 border-l-2 border-success text-success text-sm rounded-r-md">
          {success}
        </div>
      )}

      {/* Stage area (preview) */}
      <div className="mb-6">
        <OutfitPreview items={selectedItems} />
      </div>

      {/* Wardrobe rail */}
      <div className="bg-bg-card border border-border rounded-lg p-4">
        <h2 className="font-heading text-lg font-bold text-fg mb-3">
          Kollektion
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : wardrobeItems.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-fg-muted mb-3">
              Füge zuerst Kleidungsstücke in deiner Garderobe hinzu!
            </p>
            <button
              onClick={() => navigate('/wardrobe')}
              className="inline-block bg-bg-elevated text-accent border border-accent px-6 py-2 rounded-md text-sm font-medium min-h-[44px] transition-all duration-200 hover:bg-accent-soft hover:border-accent-hover"
            >
              Zur Garderobe
            </button>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory">
            {wardrobeItems.map((item) => {
              const selected = selectedIds.has(item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-200 snap-start focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 cursor-pointer ${
                    selected
                      ? 'border-accent shadow-[0_0_12px_rgba(212,168,67,0.4)] scale-105'
                      : 'border-border hover:border-border-accent'
                  }`}
                  aria-pressed={selected}
                  aria-label={`${item.name} - ${item.category}`}
                >
                  {imageCache.has(item.id) ? (
                    <img
                      src={imageCache.get(item.id)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-bg-elevated flex items-center justify-center text-fg-muted text-xs p-1 text-center">
                      {item.name}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default OutfitCreatorPage
