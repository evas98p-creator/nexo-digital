import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { datos } from '../lib/datos.ts'

const ANIO = new Date().getFullYear()

export function Isotipo() {
  return (
    <svg viewBox="0 0 30 30" aria-hidden="true">
      <rect x="1.5" y="1.5" width="27" height="27" rx="4" fill="#FFFFFF" stroke="#14263D" strokeWidth="1.5" />
      <path d="M1.5 10.5h27M1.5 19.5h27M10.5 1.5v27M19.5 1.5v27" stroke="#C3CEDA" strokeWidth="1.5" />
      <rect x="10.5" y="10.5" width="9" height="9" fill="#F2B544" />
      <rect x="17.5" y="17.5" width="5" height="5" fill="#E0A22B" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  )
}

export function AvisoDemo() {
  if (datos.modo !== 'demo') return null
  return (
    <div className="aviso-demo">
      Modo demostración: los datos son ficticios y se guardan solo en este navegador.
    </div>
  )
}

export function Cabecera({ children }: { children?: ReactNode }) {
  return (
    <>
      <a className="salto" href="#contenido">Saltar al contenido</a>
      <AvisoDemo />
      <header className="cabecera">
        <div className="contenedor cabecera__fila">
          <Link className="marca" to="/" aria-label="Nexo Digital, inicio">
            <Isotipo />
            Nexo Digital
          </Link>
          <nav className="menu" aria-label="Principal">
            {children}
          </nav>
        </div>
      </header>
    </>
  )
}

export function Pie({ credito = false }: { credito?: boolean }) {
  return (
    <footer className="pie">
      <div className="contenedor">
        <div className="pie__fila">
          <div className="pie__marca">
            <Link className="marca" to="/">Nexo Digital</Link>
            <p>Academia virtual de informática e inteligencia artificial para profesionales.</p>
          </div>
          <div>
            <strong>Contacto</strong>
            <ul className="pie__contacto">
              <li>San Martín 231, Godoy Cruz, Mendoza</li>
              <li><a href="tel:+542615554821">261 555 4821</a></li>
              <li><a href="mailto:nexodigital@gmail.com">nexodigital@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div className="pie__legal">
          <span>© {ANIO} Nexo Digital. Proyecto académico: los datos de contacto son ficticios.</span>
          {credito && (
            <span>
              Foto de{' '}
              <a href="https://unsplash.com/@jenspeter?utm_source=nexo_digital&utm_medium=referral" rel="noopener">
                Jens Peter Olesen
              </a>{' '}
              en{' '}
              <a href="https://unsplash.com/?utm_source=nexo_digital&utm_medium=referral" rel="noopener">Unsplash</a>
            </span>
          )}
          <Link to="/admin">Administración</Link>
        </div>
      </div>
    </footer>
  )
}
