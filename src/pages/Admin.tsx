import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Cabecera } from '../components/Marco.tsx'
import { CURSOS, buscarCurso } from '../data/cursos.ts'
import { ErrorDatos, datos } from '../lib/datos.ts'
import { exportarExcel, formatoFecha } from '../lib/exportar.ts'
import { ESTADOS } from '../types.ts'
import type { Estado, Inscripcion, Sesion } from '../types.ts'

type Vista = 'cargando' | 'acceso' | 'sin-permiso' | 'panel'

export default function Admin() {
  const [vista, setVista] = useState<Vista>('cargando')
  const [sesion, setSesion] = useState<Sesion | null>(null)

  useEffect(() => {
    document.title = 'Administración | Nexo Digital'
    let vigente = true
    ;(async () => {
      try {
        const actual = await datos.sesion()
        if (!vigente) return
        if (!actual) return setVista('acceso')
        setSesion(actual)
        setVista((await datos.esAdmin()) ? 'panel' : 'sin-permiso')
      } catch {
        if (vigente) setVista('acceso')
      }
    })()
    return () => { vigente = false }
  }, [])

  async function alIngresar(nueva: Sesion) {
    setSesion(nueva)
    setVista((await datos.esAdmin()) ? 'panel' : 'sin-permiso')
  }

  async function salir() {
    await datos.cerrarSesion()
    setSesion(null)
    setVista('acceso')
  }

  return (
    <>
      <Cabecera>
        <Link to="/">Ver el sitio</Link>
      </Cabecera>
      <main id="contenido" className="pagina">
        <div className="contenedor">
          {vista === 'cargando' && <p className="pagina__bajada">Cargando…</p>}
          {vista === 'acceso' && <Acceso alIngresar={alIngresar} />}
          {vista === 'sin-permiso' && (
            <div className="acceso">
              <h1>Sin permiso</h1>
              <p>
                La cuenta {sesion?.email} no está registrada como administradora. Pedile a quien
                administra la base que la agregue a la tabla de administradoras.
              </p>
              <div className="formulario">
                <button className="boton boton--linea" type="button" onClick={salir}>Cerrar sesión</button>
              </div>
            </div>
          )}
          {vista === 'panel' && sesion && <Panel sesion={sesion} salir={salir} />}
        </div>
      </main>
    </>
  )
}

/* ---------------- Ingreso ---------------- */
function Acceso({ alIngresar }: { alIngresar: (s: Sesion) => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const demo = datos.modo === 'demo'

  async function ingresar(evento: FormEvent) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await alIngresar(await datos.iniciarSesion(email.trim(), clave))
    } catch (e) {
      setError(
        e instanceof ErrorDatos && e.codigo === 'credenciales'
          ? 'El correo o la contraseña no coinciden.'
          : 'No pudimos conectar con la base de datos. Volvé a intentar en unos minutos.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="acceso">
      <h1>Administración</h1>
      {demo ? (
        <>
          <p>
            La aplicación está en modo demostración: todavía no está conectada a Supabase, por eso
            el panel abre sin contraseña y muestra inscripciones ficticias.
          </p>
          <form className="formulario" onSubmit={ingresar}>
            <button className="boton boton--ambar" type="submit" disabled={enviando}>
              Entrar al panel de demostración
            </button>
          </form>
        </>
      ) : (
        <>
          <p>Ingresá con tu cuenta de administradora para ver las inscripciones.</p>
          <form className="formulario" onSubmit={ingresar}>
            <div className="campo">
              <label htmlFor="admin-email">Correo electrónico</label>
              <input
                id="admin-email" type="email" autoComplete="username" required
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="campo">
              <label htmlFor="admin-clave">Contraseña</label>
              <input
                id="admin-clave" type="password" autoComplete="current-password" required
                value={clave} onChange={(e) => setClave(e.target.value)}
              />
            </div>
            {error && <div className="mensaje mensaje--error" role="alert">{error}</div>}
            <button className="boton boton--ambar" type="submit" disabled={enviando}>
              {enviando ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

/* ---------------- Panel ---------------- */
function Panel({ sesion, salir }: { sesion: Sesion; salir: () => Promise<void> }) {
  const [filas, setFilas] = useState<Inscripcion[] | null>(null)
  const [error, setError] = useState('')
  const [buscar, setBuscar] = useState('')
  const [curso, setCurso] = useState('')
  const [estado, setEstado] = useState('')
  const [aEliminar, setAEliminar] = useState<Inscripcion | null>(null)
  const [aviso, setAviso] = useState('')
  const dialogo = useRef<HTMLDialogElement>(null)

  const ERROR_LECTURA = 'No pudimos leer las inscripciones. Revisá tu conexión y tocá Actualizar.'

  async function cargar() {
    setError('')
    try {
      setFilas(await datos.listar())
    } catch {
      setError(ERROR_LECTURA)
    }
  }

  useEffect(() => {
    let vigente = true
    datos.listar().then(
      (leidas) => { if (vigente) setFilas(leidas) },
      () => { if (vigente) setError(ERROR_LECTURA) },
    )
    return () => { vigente = false }
  }, [])

  useEffect(() => {
    if (!aviso) return
    const reloj = window.setTimeout(() => setAviso(''), 3500)
    return () => window.clearTimeout(reloj)
  }, [aviso])

  useEffect(() => {
    const d = dialogo.current
    if (!d) return
    if (aEliminar && !d.open) d.showModal()
    if (!aEliminar && d.open) d.close()
  }, [aEliminar])

  const visibles = useMemo(() => {
    const texto = buscar.trim().toLowerCase()
    return (filas ?? []).filter((f) => {
      if (curso && f.curso !== curso) return false
      if (estado && f.estado !== estado) return false
      if (!texto) return true
      return [f.nombre, f.apellido, f.email, f.telefono ?? '', f.profesion ?? '']
        .join(' ').toLowerCase().includes(texto)
    })
  }, [filas, buscar, curso, estado])

  const activas = (filas ?? []).filter((f) => f.estado !== 'cancelado')
  const pendientes = (filas ?? []).filter((f) => f.estado === 'pendiente').length
  const confirmadas = (filas ?? []).filter((f) => f.estado === 'confirmado').length

  async function cambiarEstado(fila: Inscripcion, nuevo: Estado) {
    const anterior = filas
    setFilas((previo) => (previo ?? []).map((f) => (f.id === fila.id ? { ...f, estado: nuevo } : f)))
    try {
      await datos.cambiarEstado(fila.id, nuevo)
      setAviso(`Estado de ${fila.nombre} ${fila.apellido} actualizado.`)
    } catch {
      setFilas(anterior)
      setAviso('No se pudo cambiar el estado. Volvé a intentar.')
    }
  }

  async function eliminar() {
    const fila = aEliminar
    if (!fila) return
    setAEliminar(null)
    try {
      await datos.eliminar(fila.id)
      setFilas((previo) => (previo ?? []).filter((f) => f.id !== fila.id))
      setAviso('Inscripción eliminada.')
    } catch {
      setAviso('No se pudo eliminar la inscripción. Volvé a intentar.')
    }
  }

  async function exportar() {
    try {
      const archivo = await exportarExcel(visibles)
      setAviso(`Se descargó ${archivo} con ${visibles.length} ${visibles.length === 1 ? 'fila' : 'filas'}.`)
    } catch {
      setAviso('No se pudo generar el archivo de Excel.')
    }
  }

  return (
    <>
      <div className="panel__cabeza">
        <h1>Inscripciones</h1>
        <div className="panel__usuario">
          <span>{sesion.email}</span>
          <button className="boton boton--linea boton--chico" type="button" onClick={salir}>Cerrar sesión</button>
        </div>
      </div>

      {error && <div className="mensaje mensaje--error" role="alert" style={{ marginTop: '1.5rem' }}>{error}</div>}

      <div className="resumen">
        <section className="bloque" aria-labelledby="t-resumen">
          <h2 id="t-resumen">Resumen</h2>
          <div className="cifras">
            <div><strong>{activas.length}</strong><span>inscriptos activos</span></div>
            <div><strong>{pendientes}</strong><span>pendientes de contacto</span></div>
            <div><strong>{confirmadas}</strong><span>confirmados</span></div>
          </div>
        </section>
        <section className="bloque" aria-labelledby="t-ocupacion">
          <h2 id="t-ocupacion">Ocupación por curso</h2>
          <ul className="ocupacion">
            {CURSOS.map((c) => {
              const usados = activas.filter((f) => f.curso === c.slug).length
              const lleno = usados >= c.cupo
              return (
                <li key={c.slug} data-tono={c.tono} className={lleno ? 'cupo cupo--lleno' : 'cupo'}>
                  <div className="ocupacion__fila">
                    <span>{c.nombre}</span>
                    <span>{usados} / {c.cupo}</span>
                  </div>
                  <div className="cupo__barra">
                    <span style={{ width: `${Math.min(100, Math.round((usados / c.cupo) * 100))}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <div className="herramientas">
        <div className="campo campo--buscar">
          <label htmlFor="f-buscar">Buscar por nombre, correo o profesión</label>
          <input id="f-buscar" type="search" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="f-curso">Curso</label>
          <select id="f-curso" value={curso} onChange={(e) => setCurso(e.target.value)}>
            <option value="">Todos los cursos</option>
            {CURSOS.map((c) => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="f-estado">Estado</label>
          <select id="f-estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => <option key={e.valor} value={e.valor}>{e.nombre}</option>)}
          </select>
        </div>
        <div className="herramientas__acciones">
          <button className="boton boton--linea boton--chico" type="button" onClick={() => void cargar()}>Actualizar</button>
          <button className="boton boton--ambar boton--chico" type="button" onClick={() => void exportar()} disabled={visibles.length === 0}>
            Exportar a Excel
          </button>
        </div>
      </div>

      <div className="tabla-caja">
        <table className="tabla">
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Persona</th>
              <th scope="col">Curso</th>
              <th scope="col">Contacto</th>
              <th scope="col">Estado</th>
              <th scope="col"><span className="solo-lectores">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {filas === null && !error && (
              <tr><td colSpan={6} className="tabla__vacio">Cargando inscripciones…</td></tr>
            )}
            {filas !== null && visibles.length === 0 && (
              <tr>
                <td colSpan={6} className="tabla__vacio">
                  {filas.length === 0
                    ? 'Todavía no hay inscripciones. Cuando alguien complete el formulario del sitio, aparece acá.'
                    : 'Ninguna inscripción coincide con los filtros. Probá con otro curso o borrá la búsqueda.'}
                </td>
              </tr>
            )}
            {visibles.map((f) => (
              <tr key={f.id}>
                <td className="fecha">{formatoFecha(f.creado_en)}</td>
                <td>
                  {f.apellido}, {f.nombre}
                  {f.profesion && <span className="secundario">{f.profesion}</span>}
                  {f.mensaje && <span className="secundario">Consulta: {f.mensaje}</span>}
                </td>
                <td>
                  <span className="etiqueta-curso" data-tono={buscarCurso(f.curso)?.tono}>
                    {buscarCurso(f.curso)?.nombre ?? f.curso}
                  </span>
                </td>
                <td>
                  <a href={`mailto:${f.email}`}>{f.email}</a>
                  {f.telefono && <span className="secundario">{f.telefono}</span>}
                </td>
                <td>
                  <select
                    aria-label={`Estado de ${f.nombre} ${f.apellido}`}
                    data-estado={f.estado}
                    value={f.estado}
                    onChange={(e) => void cambiarEstado(f, e.target.value as Estado)}
                  >
                    {ESTADOS.map((e) => <option key={e.valor} value={e.valor}>{e.nombre}</option>)}
                  </select>
                </td>
                <td>
                  <button className="quitar" type="button" onClick={() => setAEliminar(f)}>
                    Eliminar<span className="solo-lectores"> la inscripción de {f.nombre} {f.apellido}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filas !== null && (
        <p className="conteo">
          {visibles.length} de {filas.length} {filas.length === 1 ? 'inscripción' : 'inscripciones'}
        </p>
      )}

      <dialog className="confirmar" ref={dialogo} onClose={() => setAEliminar(null)} aria-labelledby="t-eliminar">
        <h2 id="t-eliminar">Eliminar inscripción</h2>
        <p>
          Se borra la inscripción de {aEliminar?.nombre} {aEliminar?.apellido} en{' '}
          {buscarCurso(aEliminar?.curso)?.nombre}. No se puede deshacer.
        </p>
        <div className="acciones">
          <button className="boton boton--linea boton--chico" type="button" onClick={() => setAEliminar(null)}>Cancelar</button>
          <button className="boton boton--peligro boton--chico" type="button" onClick={() => void eliminar()}>Eliminar</button>
        </div>
      </dialog>

      <div className="avisos" role="status" aria-live="polite">
        {aviso && <div>{aviso}</div>}
      </div>
    </>
  )
}
