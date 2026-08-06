import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-pill text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-accent bg-accent-soft'
        : 'text-fg-muted hover:text-fg hover:bg-accent-soft'
    }`

  return (
    <nav className="sticky top-0 z-50 h-16 bg-[rgba(15,7,18,0.85)] backdrop-blur-[12px] border-b border-border px-6 flex items-center justify-between">
      <Link
        to="/"
        className="font-heading text-accent text-xl font-bold tracking-[0.5px] no-underline"
      >
        Red Carpet Closet
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-1">
        <NavLink to="/wardrobe" className={linkClass}>
          Garderobe
        </NavLink>
        <NavLink to="/outfits/create" className={linkClass}>
          Outfit-Creator
        </NavLink>
        <NavLink to="/outfits" className={linkClass}>
          Gespeicherte Outfits
        </NavLink>
        <NavLink to="/login" className={linkClass}>
          Login
        </NavLink>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 text-fg-muted hover:text-fg"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menü öffnen"
        aria-expanded={menuOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {menuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-bg-elevated border-b border-border md:hidden">
          <div className="flex flex-col p-4 gap-2">
            <NavLink
              to="/wardrobe"
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              Garderobe
            </NavLink>
            <NavLink
              to="/outfits/create"
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              Outfit-Creator
            </NavLink>
            <NavLink
              to="/outfits"
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              Gespeicherte Outfits
            </NavLink>
            <NavLink
              to="/login"
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              Login
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
