import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Outfit } from '../api/outfits.ts'
import { getOutfits, deleteOutfit } from '../api/outfits.ts'
import OutfitCard from '../components/OutfitCard.tsx'

function OutfitsListPage() {
  const navigate = useNavigate()
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadOutfits() {
    setLoading(true)
    setError(null)
    try {
      const data = await getOutfits()
      setOutfits(data)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Outfits konnten nicht geladen werden',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOutfits()
  }, [])

  async function handleDelete(id: number) {
    try {
      await deleteOutfit(id)
      setOutfits((prev) => prev.filter((o) => o.id !== id))
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Outfit konnte nicht gelöscht werden',
      )
    }
  }

  return (
    <div className="py-6 md:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-fg mb-2">
            Gespeicherte Outfits
          </h1>
          <p className="text-fg-muted">
            Deine kreierten Outfits auf einen Blick.
          </p>
        </div>
        <button
          onClick={() => navigate('/outfits/create')}
          className="bg-accent text-bg font-semibold px-6 py-3 rounded-md min-h-[44px] transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_4px_20px_rgba(212,168,67,0.45)] hover:-translate-y-px active:bg-[#C49A30] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          Neues Outfit
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-danger/10 border-l-2 border-danger text-danger text-sm rounded-r-md">
          {error}
          <button
            onClick={loadOutfits}
            className="ml-3 underline hover:text-white transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : outfits.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4 opacity-30">&#x1F457;</div>
          <p className="text-fg-muted text-lg mb-4">
            Noch keine Outfits gespeichert.
          </p>
          <button
            onClick={() => navigate('/outfits/create')}
            className="inline-block bg-accent text-bg font-semibold px-6 py-3 rounded-md min-h-[44px] transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_4px_20px_rgba(212,168,67,0.45)] hover:-translate-y-px active:bg-[#C49A30] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            Erstes Outfit erstellen
          </button>
        </div>
      ) : (
        /* Outfit list */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {outfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default OutfitsListPage
