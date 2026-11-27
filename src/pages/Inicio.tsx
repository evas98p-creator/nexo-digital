import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FichaCurso from '../components/FichaCurso.tsx'
import { Cabecera, Pie } from '../components/Marco.tsx'
import { CURSOS } from '../data/cursos.ts'
import { datos } from '../lib/datos.ts'

const FORMULA = '=APRENDER("inteligencia artificial"; tu_profesión)'
const FOTO =
  'https://images.unsplash.com/photo-1662239090914-1da951eaeda4?ixlib=rb-4.1.0&auto=format&fit=crop&w=1800&q=70'

/** Escribe la fórmula de la portada como si se tipeara en la barra de Excel. */
function BarraDeFormula() {
  const sinMovimiento =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [letras, setLetras] = useState(sinMovimiento ? FORMULA.length : 0)

  useEffect(() => {
    if (letras >= FORMULA.length) return
    const reloj = window.setTimeout(() => setLetras((n) => n + 1), 38)
    return () => window.clearTimeout(reloj)
  }, [letras])

  const corte = FORMULA.indexOf('(')
  return (
    <div className="formula" aria-hidden="true">
      <span className="formula__ref">A1</span>
      <span className="formula__fx">fx</span>
      <span className="formula__texto">
        <span className="fn">{FORMULA.slice(0, Math.min(letras, corte))}</span>
        {letras > corte ? FORMULA.slice(corte, letras) : ''}
        <span className="formula__cursor" />
      </span>
    </div>
  )
}

export default function Inicio() {
  const [ocupacion, setOcupacion] = useState<Record<string, number> | null>(null)
  const { hash } = useLocation()

  useEffect(() => {
    document.title = 'Nexo Digital | Cursos de inteligencia artificial para profesionales'
    let vigente = true
    datos.ocupacion().then(
      (mapa) => { if (vigente) setOcupacion(mapa) },
      () => { /* sin conexión con la base: las fichas muestran el cupo total */ },
    )
    return () => { vigente = false }
  }, [])

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  return (
    <>
      <Cabecera>
        <Link to="/#cursos">Cursos</Link>
        <Link to="/#como-funciona">Cómo funciona</Link>
        <Link className="boton boton--ambar boton--chico" to="/inscripcion">Inscribirme</Link>
      </Cabecera>

      <main id="contenido">
        <section className="portada" aria-labelledby="titulo-portada">
          <img
            className="portada__foto" alt="" width={1800} height={1200} src={FOTO}
            onError={(e) => { e.currentTarget.hidden = true }}
          />
          <div className="contenedor">
            <div className="portada__hoja">
              <BarraDeFormula />
              <div className="portada__texto">
            <h1 id="titulo-portada">
              Inteligencia artificial para <span className="celda">tu profesión</span>
            </h1>
            <p className="portada__bajada">
              Cursos virtuales para contadores, administradores y profesionales del turismo y del
              comercio exterior. Dictados por docentes que usan IA en su trabajo.
            </p>
            <div className="portada__acciones">
              <Link className="boton boton--ambar" to="/inscripcion">Inscribirme</Link>
              <Link className="boton boton--linea" to="/#cursos">Ver los cursos</Link>
            </div>
              </div>
            </div>
          </div>
        </section>

        <section className="seccion" id="cursos" aria-labelledby="titulo-cursos">
          <div className="contenedor">
            <div className="seccion__cabeza">
              <h2 id="titulo-cursos">Cursos con inscripción abierta</h2>
              <p>
                Cada curso parte de tareas reales de tu profesión. Los lugares libres se actualizan
                con cada inscripción.
              </p>
            </div>
            <div className="planilla">
              {CURSOS.map((curso) => (
                <FichaCurso key={curso.slug} curso={curso} ocupados={ocupacion?.[curso.slug] ?? (ocupacion ? 0 : undefined)} />
              ))}
            </div>
          </div>
        </section>

        <section className="seccion seccion--cielo" id="como-funciona" aria-labelledby="titulo-pasos">
          <div className="contenedor">
            <div className="seccion__cabeza">
              <h2 id="titulo-pasos">Cómo funciona la inscripción</h2>
            </div>
            <ol className="pasos">
              <li>
                <span className="pasos__n">Paso 1</span>
                <h3>Elegís el curso</h3>
                <p>Revisá temas, horario y lugares libres de cada propuesta.</p>
              </li>
              <li>
                <span className="pasos__n">Paso 2</span>
                <h3>Completás el formulario</h3>
                <p>Lleva un minuto. Tu inscripción queda registrada al instante.</p>
              </li>
              <li>
                <span className="pasos__n">Paso 3</span>
                <h3>Te escribimos</h3>
                <p>Confirmamos tu lugar por correo y te enviamos los datos de cursado.</p>
              </li>
            </ol>
          </div>
        </section>
      </main>

      <Pie credito />
    </>
  )
}
