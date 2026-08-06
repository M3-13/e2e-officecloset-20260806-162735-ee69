import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('app shell', () => {
  it('renders the navbar brand and the home page for the root route', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(html).toContain('Red Carpet Closet')
    expect(html).toContain('Willkommen in deinem')
  })

  it('renders a page for every registered route', () => {
    const cases: Array<[string, string]> = [
      ['/login', 'Login'],
      ['/register', 'Registrierung'],
      ['/wardrobe', 'Garderobe'],
      ['/outfits/create', 'Outfit-Creator'],
      ['/outfits', 'Gespeicherte Outfits'],
    ]
    for (const [path, heading] of cases) {
      const html = renderToString(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      )
      expect(html).toContain(heading)
    }
  })
})