import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import WardrobePage from './pages/WardrobePage.tsx'
import OutfitCreatorPage from './pages/OutfitCreatorPage.tsx'
import OutfitsListPage from './pages/OutfitsListPage.tsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/wardrobe" element={<WardrobePage />} />
        <Route path="/outfits/create" element={<OutfitCreatorPage />} />
        <Route path="/outfits" element={<OutfitsListPage />} />
      </Route>
    </Routes>
  )
}

export default App
