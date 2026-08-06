export interface ClothingItem {
  id: number
  name: string
  category: string
  image_path: string
  owner_id: number
  created_at: string
}

export const CATEGORIES = [
  'Oberteile',
  'Hosen',
  'Schuhe',
  'Accessoires',
  'Kleider',
] as const

export const ALL_CATEGORIES = ['Alle', ...CATEGORIES] as const
