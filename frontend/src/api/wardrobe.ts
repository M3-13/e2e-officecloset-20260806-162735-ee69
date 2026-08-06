import type { ClothingItem } from './types.ts'
import { api, BASE_URL } from './client.ts'

export async function getItems(category?: string): Promise<ClothingItem[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : ''
  return api.get<ClothingItem[]>(`/api/wardrobe${query}`)
}

export async function createItem(data: FormData): Promise<ClothingItem> {
  return api.postFormData<ClothingItem>('/api/wardrobe', data)
}

export async function getImageUrl(id: number): Promise<string> {
  const t = localStorage.getItem('token')
  const resp = await fetch(`${BASE_URL}/api/wardrobe/${id}/image`, {
    headers: t ? { Authorization: `Bearer ${t}` } : {},
  })
  if (!resp.ok) {
    throw new Error('Failed to load image')
  }
  const blob = await resp.blob()
  return URL.createObjectURL(blob)
}

export async function deleteItem(id: number): Promise<void> {
  await api.delete(`/api/wardrobe/${id}`)
}
