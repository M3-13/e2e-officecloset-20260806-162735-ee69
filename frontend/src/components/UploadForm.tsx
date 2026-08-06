import { useState, useRef, useEffect, type FormEvent, type DragEvent } from 'react'
import { createItem } from '../api/wardrobe.ts'
import { CATEGORIES } from '../api/types.ts'

interface UploadFormProps {
  onSuccess: () => void
}

function UploadForm({ onSuccess }: UploadFormProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function reset() {
    setName('')
    setCategory('')
    setFile(null)
    setPreview(null)
    setError(null)
  }

  function handleFile(f: File) {
    if (!f.type.startsWith('image/')) {
      setError('Bitte wähle eine Bilddatei aus.')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Die Datei darf nicht größer als 5 MB sein.')
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    setFile(f)
    setError(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Bitte gib einen Namen ein.')
      return
    }
    if (!category) {
      setError('Bitte wähle eine Kategorie aus.')
      return
    }
    if (!file) {
      setError('Bitte wähle ein Bild aus.')
      return
    }

    setLoading(true)
    try {
      const data = new FormData()
      data.append('name', name.trim())
      data.append('category', category)
      data.append('image', file)
      await createItem(data)
      reset()
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hochladen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-[480px] w-full bg-bg-elevated rounded-lg p-8 border border-border"
    >
      <h2 className="font-heading text-2xl font-bold mb-6">
        Neues Kleidungsstück
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-[rgba(224,85,106,0.12)] border-l-[3px] border-danger text-fg text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="wardrobe-name" className="block text-sm text-fg-muted mb-1">
          Name
        </label>
        <input
          id="wardrobe-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Schwarze Lederjacke"
          className="w-full bg-bg-elevated text-fg border border-border rounded-md px-4 py-3 min-h-[44px] text-base placeholder:text-fg-muted focus:border-accent focus:shadow-[0_0_0_3px_rgba(212,168,67,0.2)] transition-[border-color,box-shadow] duration-200 outline-none disabled:opacity-40"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="wardrobe-category" className="block text-sm text-fg-muted mb-1">
          Kategorie
        </label>
        <select
          id="wardrobe-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-bg-elevated text-fg border border-border rounded-md px-4 py-3 min-h-[44px] text-base focus:border-accent focus:shadow-[0_0_0_3px_rgba(212,168,67,0.2)] transition-[border-color,box-shadow] duration-200 outline-none disabled:opacity-40 appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ADA0B8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 12px center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '20px',
            paddingRight: '40px',
          }}
        >
          <option value="" disabled>
            Kategorie auswählen...
          </option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-fg-muted mb-1">Bild</label>
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click()
            }
          }}
          className={`relative border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors duration-200 min-h-[120px] flex flex-col items-center justify-center ${
            dragOver
              ? 'border-accent bg-accent-soft'
              : 'border-border hover:border-accent/50'
          }`}
        >
          {preview ? (
            <img
              src={preview}
              alt="Vorschau"
              className="max-h-48 rounded-md object-contain"
            />
          ) : (
            <div className="text-fg-muted text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mx-auto mb-2 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p>
                {dragOver
                  ? 'Zum Hochladen loslassen'
                  : 'Bild hier ablegen oder klicken zum Auswählen'}
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold text-sm min-h-[44px] bg-accent text-bg shadow-[0_2px_12px_rgba(212,168,67,0.3)] hover:bg-accent-hover hover:shadow-[0_4px_20px_rgba(212,168,67,0.45)] hover:-translate-y-px active:bg-[#C49A30] active:shadow-[0_1px_6px_rgba(212,168,67,0.3)] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4 mr-2"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : null}
        {loading ? 'Wird hochgeladen...' : 'Hinzufügen'}
      </button>
    </form>
  )
}

export default UploadForm
