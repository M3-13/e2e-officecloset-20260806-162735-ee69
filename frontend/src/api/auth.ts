import { api } from './client'

const BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface DeleteAccountResponse {
  message: string
}

export async function register(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/auth/register', {
    email,
    password,
  })
  localStorage.setItem('token', res.access_token)
  return res
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const formBody = new URLSearchParams({ username: email, password })
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody.toString(),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(detail.detail ?? res.statusText)
  }
  const data: AuthResponse = await res.json()
  localStorage.setItem('token', data.access_token)
  return data
}

export async function deleteAccount(): Promise<DeleteAccountResponse> {
  const res = await api.delete<DeleteAccountResponse>('/api/auth/account')
  localStorage.removeItem('token')
  return res
}
