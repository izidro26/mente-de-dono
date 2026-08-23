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
import { useSettingsStore, applyThemeClass } from './store/useSettingsStore'

function App() {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    applyThemeClass(theme)
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => applyThemeClass('system')
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [theme])

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
          <Route path="/ajustes" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
