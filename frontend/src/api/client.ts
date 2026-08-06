export const BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function token(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${BASE_URL}${path}`
  const headers: Record<string, string> = {}
  const t = token()
  if (t) {
    headers['Authorization'] = `Bearer ${t}`
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(detail.detail ?? res.statusText)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json()
}

async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const url = `${BASE_URL}${path}`
  const headers: Record<string, string> = {}
  const t = token()
  if (t) {
    headers['Authorization'] = `Bearer ${t}`
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(detail.detail ?? res.statusText)
  }

  return res.json()
}

async function deleteRequest<T>(path: string): Promise<T> {
  return request<T>('DELETE', path)
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  postFormData: <T>(path: string, formData: FormData) =>
    postFormData<T>(path, formData),
  delete: <T>(path: string) => deleteRequest<T>(path),
}
