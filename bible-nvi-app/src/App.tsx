import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { BookPicker } from './pages/BookPicker'
import { ChapterReader } from './pages/ChapterReader'
import { Search } from './pages/Search'
import { Plans } from './pages/Plans'
import { PlanDetail } from './pages/PlanDetail'
import { Notes } from './pages/Notes'
import { Memorize } from './pages/Memorize'
import { Downloads } from './pages/Downloads'
import { Settings } from './pages/Settings'
import { Theology } from './pages/Theology'
import { TheologyLocus } from './pages/TheologyLocus'
import { useSettingsStore, applyThemeClass } from './store/useSettingsStore'
import { ensureStarterPackDownloaded } from './lib/starterPack'

function App() {
  const theme = useSettingsStore((s) => s.theme)
  const version = useSettingsStore((s) => s.version)

  useEffect(() => {
    applyThemeClass(theme)
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => applyThemeClass('system')
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [theme])

  useEffect(() => {
    // Silencioso, em segundo plano: garante que sempre haja algo pra ler
    // offline, mesmo que o usuário nunca abra a tela de Downloads.
    ensureStarterPackDownloaded(version)
    const onOnline = () => ensureStarterPackDownloaded(version)
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [version])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/ler" element={<BookPicker />} />
          <Route path="/ler/:abbrev/:chapter" element={<ChapterReader />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/planos" element={<Plans />} />
          <Route path="/planos/:id" element={<PlanDetail />} />
          <Route path="/notas" element={<Notes />} />
          <Route path="/memorizar" element={<Memorize />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/estudos" element={<Theology />} />
          <Route path="/estudos/:id" element={<TheologyLocus />} />
          <Route path="/ajustes" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
