import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Inicio from './pages/Inicio.tsx'
import Inscripcion from './pages/Inscripcion.tsx'

// El panel se descarga solo cuando alguien entra a /admin.
const Admin = lazy(() => import('./pages/Admin.tsx'))

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/inscripcion" element={<Inscripcion />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Inicio />} />
      </Routes>
    </Suspense>
  )
}
