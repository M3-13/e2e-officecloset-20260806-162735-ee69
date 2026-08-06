import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import WardrobePage from './pages/WardrobePage.tsx'
import UploadForm from './components/UploadForm.tsx'
import CategoryFilter from './components/CategoryFilter.tsx'
import WardrobeGallery from './components/WardrobeGallery.tsx'
import WardrobeCard from './components/WardrobeCard.tsx'
import type { ClothingItem } from './api/types.ts'

const MOCK_ITEM: ClothingItem = {
  id: 1,
  name: 'Schwarze Lederjacke',
  category: 'Oberteile',
  image_path: '/uploads/test.jpg',
  owner_id: 1,
  created_at: '2026-01-01T00:00:00',
}

const MOCK_ITEMS: ClothingItem[] = [MOCK_ITEM]

describe('WardrobePage', () => {
  it('renders heading and upload form', () => {
    const html = renderToString(<WardrobePage />)
    expect(html).toContain('Garderobe')
    expect(html).toContain('Neues Kleidungsstück')
  })

  it('renders category filter pills', () => {
    const html = renderToString(<WardrobePage />)
    expect(html).toContain('Alle')
    expect(html).toContain('Oberteile')
    expect(html).toContain('Hosen')
    expect(html).toContain('Schuhe')
    expect(html).toContain('Accessoires')
    expect(html).toContain('Kleider')
  })
})

describe('UploadForm', () => {
  it('renders form fields', () => {
    const html = renderToString(<UploadForm onSuccess={() => {}} />)
    expect(html).toContain('Neues Kleidungsstück')
    expect(html).toContain('Name')
    expect(html).toContain('Kategorie')
    expect(html).toContain('Bild')
    expect(html).toContain('Hinzufügen')
  })
})

describe('CategoryFilter', () => {
  it('renders all filter pills', () => {
    const html = renderToString(
      <CategoryFilter active="Alle" onChange={() => {}} />,
    )
    expect(html).toContain('Alle')
    expect(html).toContain('Oberteile')
    expect(html).toContain('Hosen')
    expect(html).toContain('Schuhe')
    expect(html).toContain('Accessoires')
    expect(html).toContain('Kleider')
  })
})

describe('WardrobeGallery', () => {
  it('renders empty state when no items', () => {
    const html = renderToString(
      <WardrobeGallery items={[]} onDelete={() => {}} />,
    )
    expect(html).toContain('Deine Garderobe ist noch leer')
  })

  it('renders items when present', () => {
    const html = renderToString(
      <WardrobeGallery items={MOCK_ITEMS} onDelete={() => {}} />,
    )
    expect(html).toContain('Schwarze Lederjacke')
  })
})

describe('WardrobeCard', () => {
  it('renders item name and category badge', () => {
    const html = renderToString(
      <WardrobeCard item={MOCK_ITEM} onDelete={() => {}} />,
    )
    expect(html).toContain('Schwarze Lederjacke')
    expect(html).toContain('Oberteile')
  })
})
