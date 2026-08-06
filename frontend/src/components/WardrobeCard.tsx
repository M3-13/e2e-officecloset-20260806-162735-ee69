import { useState, useEffect, useRef } from 'react'
import type { ClothingItem } from '../api/types.ts'
import { getImageUrl } from '../api/wardrobe.ts'

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Oberteile: { bg: 'bg-accent-soft', text: 'text-accent' },
  Hosen: { bg: 'bg-[rgba(153,130,180,0.2)]', text: 'text-[#B8A0D8]' },
  Schuhe: { bg: 'bg-[rgba(76,175,141,0.18)]', text: 'text-success' },
  Accessoires: { bg: 'bg-[rgba(224,85,106,0.18)]', text: 'text-danger' },
  Kleider: { bg: 'bg-[rgba(232,197,109,0.15)]', text: 'text-accent-hover' },
}

interface WardrobeCardProps {
  item: ClothingItem
  onDelete: (id: number) => void
}

function WardrobeCard({ item, onDelete }: WardrobeCardProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    getImageUrl(item.id)
      .then((url) => {
        if (!cancelled) {
          objectUrl = url
          setImgSrc(url)
        } else {
          URL.revokeObjectURL(url)
        }
      })
      .catch(() => {
        if (!cancelled) setImgError(true)
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [item.id])

  useEffect(() => {
    if (!confirmDelete) return
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setConfirmDelete(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [confirmDelete])

  const colors = CATEGORY_COLORS[item.category] ?? {
    bg: 'bg-bg-hover',
    text: 'text-fg-muted',
  }

  return (
    <div
      ref={cardRef}
      className="group relative bg-bg-card rounded-lg overflow-hidden border border-border hover:border-border-accent hover:shadow-[0_8px_32px_rgba(212,168,67,0.12)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus-within:outline-2 focus-within:outline-accent focus-within:outline-offset-2"
    >
      <div className="relative aspect-square bg-bg-elevated overflow-hidden">
        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-fg-muted">
            {imgError ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 opacity-40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            ) : (
              <div className="animate-pulse w-10 h-10 rounded-md bg-bg-hover" />
            )}
          </div>
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(212,168,67,0.18)_0%,transparent_70%)]" />

        {confirmDelete ? (
          <div className="absolute inset-0 bg-[rgba(15,7,18,0.85)] flex flex-col items-center justify-center gap-3 p-4">
            <p className="text-sm text-fg text-center">
              Wirklich löschen?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmDelete(false)
                }}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-bg-hover text-fg-muted hover:text-fg transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item.id)
                }}
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-danger text-white hover:bg-[#C94859] active:bg-[#B33D4C] transition-colors cursor-pointer"
              >
                Löschen
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            aria-label={`${item.name} löschen`}
            onClick={(e) => {
              e.stopPropagation()
              setConfirmDelete(true)
            }}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-md bg-[rgba(15,7,18,0.7)] text-fg-muted hover:text-danger hover:bg-[rgba(224,85,106,0.2)] opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <span
          className="text-[13px] text-fg-muted truncate"
          title={item.name}
        >
          {item.name}
        </span>
        <span
          className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-pill ${colors.bg} ${colors.text}`}
        >
          {item.category}
        </span>
      </div>
    </div>
  )
}

export default WardrobeCard
