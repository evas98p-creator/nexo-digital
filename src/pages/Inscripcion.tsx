import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import FichaCurso from '../components/FichaCurso.tsx'
import { Cabecera, Pie } from '../components/Marco.tsx'
import { CURSOS, buscarCurso } from '../data/cursos.ts'
import { ErrorDatos, datos } from '../lib/datos.ts'
import { LIMITES, validarInscripcion } from '../lib/validar.ts'
import type { Errores } from '../lib/validar.ts'
import type { NuevaInscripcion } from '../types.ts'

function vacio(curso: string): NuevaInscripcion {
  return { curso, nombre: '', apellido: '', email: '', telefono: '', profesion: '', mensaje: '' }
}

export default function Inscripcion() {
  const [parametros] = useSearchParams()
  const pedido = buscarCurso(parametros.get('curso'))?.slug ?? CURSOS[0].slug

  const [v, setV] = useState<NuevaInscripcion>(() => vacio(pedido))
  const [acepto, setAcepto] = useState(false)
  const [trampa, setTrampa] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState<NuevaInscripcion | null>(null)
  const [ocupacion, setOcupacion] = useState<Record<string, number> | null>(null)

  const formulario = useRef<HTMLFormElement>(null)
  const confirmacion = useRef<HTMLElement>(null)

  useEffect(() => {
    document.title = 'Inscripción | Nexo Digital'
    let vigente = true
    datos.ocupacion().then((mapa) => { if (vigente) setOcupacion(mapa) }, () => {})
    return () => { vigente = false }
  }, [])

  useEffect(() => {
    if (enviada) confirmacion.current?.focus()
  }, [enviada])

  function cambiar(campo: keyof NuevaInscripcion, valor: string) {
    setV((previo) => ({ ...previo, [campo]: valor }))
    quitarError(campo)
  }

  /** Al corregir un campo, su mensaje de error desaparece. */
  function quitarError(campo: string) {
    setErrores((previo) => {
      if (!(campo in previo)) return previo
      const resto = { ...previo }
      delete resto[campo as keyof Errores]
      return resto
    })
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErrorGeneral('')
    if (trampa) return // campo trampa: solo lo completan los robots

    const encontrados = validarInscripcion(v, acepto)
    setErrores(encontrados)
    const primero = (['nombre', 'apellido', 'email', 'acepto'] as const).find((c) => encontrados[c])
    if (primero) {
      formulario.current?.querySelector<HTMLElement>(`#${primero}`)?.focus()
      return
    }

    setEnviando(true)
    try {
      await datos.crearInscripcion(v)
      setOcupacion((previo) => ({ ...(previo ?? {}), [v.curso]: (previo?.[v.curso] ?? 0) + 1 }))
      setEnviada(v)
    } catch (e) {
      setErrorGeneral(
        e instanceof ErrorDatos && e.codigo === 'duplicado'
          ? 'Ya tenés una inscripción en este curso con ese correo. Si querés cambiar algún dato, escribinos a nexodigital@gmail.com.'
          : 'No pudimos guardar tu inscripción. Revisá tu conexión y volvé a intentar en unos minutos.',
      )
    } finally {
      setEnviando(false)
    }
  }

  function otra() {
    setV(vacio(pedido))
    setAcepto(false)
    setErrores({})
    setEnviada(null)
  }

  const curso = buscarCurso(enviada?.curso ?? v.curso) ?? CURSOS[0]
  const ocupados = ocupacion ? (ocupacion[curso.slug] ?? 0) : undefined

  return (
    <>
      <Cabecera>
        <Link to="/#cursos">Cursos</Link>
        <Link to="/#como-funciona">Cómo funciona</Link>
      </Cabecera>

      <main id="contenido" className="pagina">
        <div className="contenedor">
          <h1>Inscripción</h1>
          {!enviada && (
            <p className="pagina__bajada">Completá tus datos y confirmamos tu lugar por correo.</p>
          )}

          <div className="dos-columnas">
            <div>
              {!enviada ? (
                <form className="formulario formulario--hoja" ref={formulario} onSubmit={enviar} noValidate>
                  <div className="campo">
                    <label htmlFor="curso">Curso</label>
                    <select id="curso" value={v.curso} onChange={(e) => cambiar('curso', e.target.value)}>
                      {CURSOS.map((c) => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
                    </select>
                  </div>

                  <div className="formulario__par">
                    <div className="campo">
                      <label htmlFor="nombre">Nombre</label>
                      <input
                        id="nombre" type="text" autoComplete="given-name" maxLength={LIMITES.nombre}
                        value={v.nombre} onChange={(e) => cambiar('nombre', e.target.value)}
                        aria-invalid={errores.nombre ? true : undefined}
                        aria-describedby={errores.nombre ? 'error-nombre' : undefined}
                      />
                      {errores.nombre && <p className="campo__error" id="error-nombre">{errores.nombre}</p>}
                    </div>
                    <div className="campo">
                      <label htmlFor="apellido">Apellido</label>
                      <input
                        id="apellido" type="text" autoComplete="family-name" maxLength={LIMITES.apellido}
                        value={v.apellido} onChange={(e) => cambiar('apellido', e.target.value)}
                        aria-invalid={errores.apellido ? true : undefined}
                        aria-describedby={errores.apellido ? 'error-apellido' : undefined}
                      />
                      {errores.apellido && <p className="campo__error" id="error-apellido">{errores.apellido}</p>}
                    </div>
                  </div>

                  <div className="campo">
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                      id="email" type="email" autoComplete="email" maxLength={LIMITES.email}
                      value={v.email} onChange={(e) => cambiar('email', e.target.value)}
                      aria-invalid={errores.email ? true : undefined}
                      aria-describedby={errores.email ? 'error-email' : undefined}
                    />
                    {errores.email && <p className="campo__error" id="error-email">{errores.email}</p>}
                  </div>

                  <div className="formulario__par">
                    <div className="campo">
                      <label htmlFor="telefono">Teléfono <span className="opcional">(opcional)</span></label>
                      <input
                        id="telefono" type="tel" autoComplete="tel" maxLength={LIMITES.telefono}
                        value={v.telefono} onChange={(e) => cambiar('telefono', e.target.value)}
                      />
                    </div>
                    <div className="campo">
                      <label htmlFor="profesion">Profesión <span className="opcional">(opcional)</span></label>
                      <input
                        id="profesion" type="text" maxLength={LIMITES.profesion}
                        value={v.profesion} onChange={(e) => cambiar('profesion', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="campo">
                    <label htmlFor="mensaje">Consulta o comentario <span className="opcional">(opcional)</span></label>
                    <textarea
                      id="mensaje" maxLength={LIMITES.mensaje}
                      value={v.mensaje} onChange={(e) => cambiar('mensaje', e.target.value)}
                    />
                  </div>

                  <div className="trampa" aria-hidden="true">
                    <label htmlFor="sitio">No completar este campo</label>
                    <input
                      id="sitio" type="text" tabIndex={-1} autoComplete="off"
                      value={trampa} onChange={(e) => setTrampa(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="acepto">
                      <input
                        id="acepto" type="checkbox" checked={acepto}
                        onChange={(e) => { setAcepto(e.target.checked); quitarError('acepto') }}
                        aria-invalid={errores.acepto ? true : undefined}
                        aria-describedby={errores.acepto ? 'error-acepto' : undefined}
                      />
                      <span>Acepto que Nexo Digital use estos datos para contactarme por el curso elegido.</span>
                    </label>
                    {errores.acepto && <p className="campo__error" id="error-acepto">{errores.acepto}</p>}
                  </div>

                  {errorGeneral && <div className="mensaje mensaje--error" role="alert">{errorGeneral}</div>}

                  <div>
                    <button className="boton boton--ambar" type="submit" disabled={enviando}>
                      {enviando ? 'Enviando…' : 'Enviar inscripción'}
                    </button>
                  </div>
                </form>
              ) : (
                <section className="confirmacion" ref={confirmacion} tabIndex={-1} aria-labelledby="titulo-confirmacion">
                  <h2 id="titulo-confirmacion">Inscripción enviada</h2>
                  <p>
                    Registramos tu inscripción. Te escribimos a {enviada.email.trim()} para confirmar tu lugar.
                  </p>
                  <dl>
                    <div><dt>Curso</dt><dd>{curso.nombre}</dd></div>
                    <div><dt>Nombre</dt><dd>{enviada.nombre.trim()} {enviada.apellido.trim()}</dd></div>
                    <div><dt>Correo</dt><dd>{enviada.email.trim()}</dd></div>
                    <div><dt>Inicio</dt><dd>{curso.inicio}, {curso.horario.toLowerCase()}</dd></div>
                  </dl>
                  <div className="confirmacion__acciones">
                    <Link className="boton boton--ambar" to="/#cursos">Ver los demás cursos</Link>
                    <button className="boton boton--linea" type="button" onClick={otra}>Hacer otra inscripción</button>
                  </div>
                </section>
              )}
            </div>

            <aside className="pegado" aria-label="Curso elegido">
              <FichaCurso curso={curso} ocupados={ocupados} compacta />
            </aside>
          </div>
        </div>
      </main>

      <Pie />
    </>
  )
}
