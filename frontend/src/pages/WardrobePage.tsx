import { useState, useEffect } from 'react'
import UploadForm from '../components/UploadForm.tsx'
import CategoryFilter from '../components/CategoryFilter.tsx'
import WardrobeGallery from '../components/WardrobeGallery.tsx'
import { getItems, deleteItem } from '../api/wardrobe.ts'
import type { ClothingItem } from '../api/types.ts'

function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('Alle')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const category = activeCategory === 'Alle' ? undefined : activeCategory
        const data = await getItems(category)
        if (!cancelled) setItems(data)
      } catch (err: unknown) {
        if (!cancelled)
          setError(
            err instanceof Error
              ? err.message
              : 'Fehler beim Laden der Garderobe.',
          )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [activeCategory])

  async function handleDelete(id: number) {
    try {
      await deleteItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen.')
    }
  }

  async function handleUploadSuccess() {
    try {
      setActiveCategory('Alle')
      setLoading(true)
      setError(null)
      const data = await getItems()
      setItems(data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Fehler beim Laden der Garderobe.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-8 md:py-12">
      <h1 className="font-heading text-[2.75rem] font-bold text-center mb-10">
        Garderobe
      </h1>

      <div className="mb-12 flex justify-center">
        <UploadForm onSuccess={handleUploadSuccess} />
      </div>

      <div className="mb-8">
        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-md bg-[rgba(224,85,106,0.12)] border-l-[3px] border-danger text-fg text-sm text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
        </div>
      ) : (
        <WardrobeGallery items={items} onDelete={handleDelete} />
      )}
    </div>
  )
}

export default WardrobePage
