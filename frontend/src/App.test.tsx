import { describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext, type AuthState } from './context/AuthContext'
import App from './App'

function unauthenticated(): AuthState {
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    deleteAccount: vi.fn(),
  }
}

function authenticated(): AuthState {
  return {
    user: { id: 1, email: 'test@example.com' },
    token: 'fake-token',
    isAuthenticated: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    deleteAccount: vi.fn(),
  }
}

function renderWithAuth(
  auth: AuthState,
  initialEntries: string[],
): string {
  return renderToString(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('app shell', () => {
  it('renders the navbar brand and the home page for the root route', () => {
    const html = renderWithAuth(unauthenticated(), ['/'])
    expect(html).toContain('Red Carpet Closet')
    expect(html).toContain('Willkommen in deinem')
  })

  it('renders a page for every unprotected route', () => {
    const cases: Array<[string, string]> = [
      ['/login', 'Anmelden'],
      ['/register', 'Registrierung'],
    ]
    for (const [path, heading] of cases) {
      const html = renderWithAuth(unauthenticated(), [path])
      expect(html).toContain(heading)
    }
  })

  it('shows login link for unauthenticated users in navbar', () => {
    const html = renderWithAuth(unauthenticated(), ['/wardrobe'])
    expect(html).toContain('Login')
    expect(html).not.toContain('Logout')
  })

  it('shows logout button for authenticated users in navbar', () => {
    const html = renderWithAuth(authenticated(), ['/wardrobe'])
    expect(html).toContain('Logout')
    expect(html).not.toContain('>Login<')
  })

  it('renders protected pages for authenticated users', () => {
    const cases: Array<[string, string]> = [
      ['/wardrobe', 'Garderobe'],
      ['/outfits/create', 'Outfit-Creator'],
      ['/outfits', 'Gespeicherte Outfits'],
    ]
    for (const [path, heading] of cases) {
      const html = renderWithAuth(authenticated(), [path])
      expect(html).toContain(heading)
    }
  })
})
