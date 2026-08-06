import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/wardrobe', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-[480px] bg-bg-elevated rounded-lg p-8 border border-border">
        <h1 className="font-heading text-3xl font-bold text-center mb-2">
          Anmelden
        </h1>
        <p className="text-fg-muted text-sm text-center mb-8">
          Willkommen zurück im Red Carpet Closet
        </p>

        {error && (
          <div
            className="mb-6 p-3 rounded-md text-sm border border-danger bg-[rgba(224,85,106,0.1)] text-danger"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-fg-muted mb-1"
            >
              E-Mail
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="deine@email.de"
              className="w-full bg-bg-elevated text-fg border border-border rounded-md px-4 py-3 font-sans text-base min-h-[44px] placeholder:text-fg-muted focus:border-accent focus:shadow-[0_0_0_3px_rgba(212,168,67,0.2)] outline-none transition-[border-color,box-shadow] duration-200"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-fg-muted mb-1"
            >
              Passwort
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-bg-elevated text-fg border border-border rounded-md px-4 py-3 font-sans text-base min-h-[44px] placeholder:text-fg-muted focus:border-accent focus:shadow-[0_0_0_3px_rgba(212,168,67,0.2)] outline-none transition-[border-color,box-shadow] duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold text-sm min-h-[44px] bg-accent text-bg shadow-[0_2px_12px_rgba(212,168,67,0.3)] hover:bg-accent-hover hover:shadow-[0_4px_20px_rgba(212,168,67,0.45)] hover:-translate-y-px active:bg-[#C49A30] active:shadow-[0_1px_6px_rgba(212,168,67,0.3)] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {loading ? 'Wird angemeldet...' : 'Anmelden'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-fg-muted">
          Noch keinen Account?{' '}
          <Link
            to="/register"
            className="text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
          >
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
