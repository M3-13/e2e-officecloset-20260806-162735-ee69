import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.tsx'

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-6 pb-12">
        <Outlet />
      </main>
      <footer className="bg-bg-card border-t border-border py-6 text-center text-fg-muted text-xs">
        &copy; {new Date().getFullYear()} Red Carpet Closet
      </footer>
    </div>
  )
}

export default Layout
