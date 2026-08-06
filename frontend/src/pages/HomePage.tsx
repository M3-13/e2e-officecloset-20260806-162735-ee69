import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-5xl md:text-6xl font-bold mb-6">
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
