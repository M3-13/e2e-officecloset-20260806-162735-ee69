import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function HomePage() {
  const { user, isAuthenticated, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteAccount()
      navigate('/', { replace: true })
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : 'Account konnte nicht gelöscht werden',
      )
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
          Willkommen zurück,{' '}
          <span className="text-accent">{user.email}</span>
        </h1>
        <p className="text-fg-muted text-lg max-w-2xl mb-10 leading-relaxed">
          Dein Red Carpet Closet erwartet dich. Entdecke deine Garderobe, kreiere
          neue Outfits und bereite dich auf deinen großen Auftritt vor.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Link
            to="/wardrobe"
            className="inline-flex items-center px-6 py-3 rounded-md font-semibold text-sm min-h-[44px] bg-accent text-bg shadow-[0_2px_12px_rgba(212,168,67,0.3)] hover:bg-accent-hover hover:shadow-[0_4px_20px_rgba(212,168,67,0.45)] hover:-translate-y-px active:bg-[#C49A30] active:shadow-[0_1px_6px_rgba(212,168,67,0.3)] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            Zur Garderobe
          </Link>
          <Link
            to="/outfits/create"
            className="inline-flex items-center px-6 py-3 rounded-md font-semibold text-sm min-h-[44px] bg-transparent text-accent border border-accent hover:bg-accent-soft hover:border-accent-hover active:bg-[rgba(212,168,67,0.25)] disabled:opacity-35 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            Outfit erstellen
          </Link>
        </div>

        {/* Delete Account Section */}
        <div className="w-full max-w-[480px] border-t border-border pt-8">
          <h2 className="font-heading text-xl font-bold text-danger mb-3">
            Gefahrenzone
          </h2>
          <p className="text-fg-muted text-sm mb-4">
            Das Löschen deines Accounts ist endgültig. Alle deine Kleidungsstücke,
            Outfits und Bilder werden unwiderruflich entfernt.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-6 py-3 rounded-md font-semibold text-sm min-h-[44px] bg-danger text-white hover:bg-[#C94859] active:bg-[#B33D4C] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              Account löschen
            </button>
          ) : (
            <div className="bg-bg-card rounded-md p-4 border border-danger">
              <p className="text-sm text-fg mb-4">
                Bist du sicher, dass du deinen Account unwiderruflich löschen
                möchtest?
              </p>

              {deleteError && (
                <div className="mb-4 p-3 rounded-md text-sm border border-danger bg-[rgba(224,85,106,0.1)] text-danger">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="inline-flex items-center px-6 py-3 rounded-md font-semibold text-sm min-h-[44px] bg-danger text-white hover:bg-[#C94859] active:bg-[#B33D4C] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {deleting ? 'Wird gelöscht...' : 'Ja, Account löschen'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="inline-flex items-center px-6 py-3 rounded-md font-semibold text-sm min-h-[44px] bg-transparent text-fg-muted border border-border hover:border-fg-muted hover:text-fg disabled:opacity-35 transition-all duration-200"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
        Willkommen in deinem{' '}
        <span className="text-accent">Red Carpet Closet</span>
      </h1>
      <p className="text-fg-muted text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
        Dein glamouröser Kleiderschrank-Manager im Hollywood-Stil. Organisiere
        deine Garderobe, kreiere atemberaubende Outfits und bereite dich auf
        deinen großen Auftritt vor.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          to="/register"
          className="inline-flex items-center px-6 py-3 rounded-md font-semibold text-sm min-h-[44px] bg-accent text-bg shadow-[0_2px_12px_rgba(212,168,67,0.3)] hover:bg-accent-hover hover:shadow-[0_4px_20px_rgba(212,168,67,0.45)] hover:-translate-y-px active:bg-[#C49A30] active:shadow-[0_1px_6px_rgba(212,168,67,0.3)] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          Jetzt loslegen
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center px-6 py-3 rounded-md font-semibold text-sm min-h-[44px] bg-transparent text-accent border border-accent hover:bg-accent-soft hover:border-accent-hover active:bg-[rgba(212,168,67,0.25)] disabled:opacity-35 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          Anmelden
        </Link>
      </div>
    </div>
  )
}

export default HomePage
