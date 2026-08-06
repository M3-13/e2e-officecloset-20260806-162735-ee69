import { api } from './client.ts'

const BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export interface ClothingItem {
  id: number
  name: string
  category: string
  image_path: string
  owner_id: number
  created_at: string
}

export interface Outfit {
  id: number
  name: string
  owner_id: number
  created_at: string
  items: ClothingItem[]
}

interface OutfitCreate {
  name: string
  item_ids: number[]
}

export async function getOutfits(): Promise<Outfit[]> {
  return api.get<Outfit[]>('/api/outfits')
}

export async function createOutfit(
  name: string,
  itemIds: number[],
): Promise<Outfit> {
  const body: OutfitCreate = { name, item_ids: itemIds }
  return api.post<Outfit>('/api/outfits', body)
}

export async function deleteOutfit(id: number): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/api/outfits/${id}`)
}

export async function fetchWardrobeItems(
  category?: string,
): Promise<ClothingItem[]> {
  const path = category
    ? `/api/wardrobe?category=${encodeURIComponent(category)}`
    : '/api/wardrobe'
  return api.get<ClothingItem[]>(path)
}

const imageCache = new Map<number, string>()

export async function fetchItemImageUrl(id: number): Promise<string> {
  if (imageCache.has(id)) {
    return imageCache.get(id)!
  }

  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE_URL}/api/wardrobe/${id}/image`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    throw new Error('Failed to load image')
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  imageCache.set(id, url)
  return url
}
