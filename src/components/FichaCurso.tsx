import { Link } from 'react-router-dom'
import { CURSOS } from '../data/cursos.ts'
import type { Curso } from '../types.ts'

interface Props {
  curso: Curso
  /** Inscriptos no cancelados. `undefined` mientras no se conoce. */
  ocupados?: number
  /** Versión corta para acompañar el formulario. */
  compacta?: boolean
}

export default function FichaCurso({ curso, ocupados, compacta = false }: Props) {
  const usados = Math.min(ocupados ?? 0, curso.cupo)
  const libres = curso.cupo - usados
  const lleno = ocupados !== undefined && libres <= 0
  const textoCupo =
    ocupados === undefined
      ? `Cupo: ${curso.cupo} lugares`
      : lleno
        ? 'Cupo completo'
        : `${libres} de ${curso.cupo} lugares libres`

  const Titulo = compacta ? 'h2' : 'h3'

  return (
    <article className="ficha" data-tono={curso.tono} id={compacta ? undefined : curso.slug}>
      <div className="ficha__titulo">
        <span className="ficha__num">{CURSOS.indexOf(curso) + 1}</span>
        <div className="ficha__nombre">
          <p className="ficha__area">{curso.area}</p>
          <Titulo>{curso.nombre}</Titulo>
        </div>
      </div>

      <div className="ficha__cuerpo">
        <p className="ficha__resumen">{curso.resumen}</p>
        {!compacta && (
          <ul className="ficha__temas">
            {curso.temas.map((t) => <li key={t}>{t}</li>)}
          </ul>
        )}
      </div>

      <dl className="ficha__datos">
        <div><dt>Duración</dt><dd>{curso.duracion}</dd></div>
        <div><dt>Inicio</dt><dd>{curso.inicio}</dd></div>
        <div><dt>Horario</dt><dd>{curso.horario}</dd></div>
        <div><dt>Modalidad</dt><dd>Virtual, en vivo</dd></div>
      </dl>

      <div className="ficha__pie">
        <div className={lleno ? 'cupo cupo--lleno' : 'cupo'}>
          <p className="cupo__texto">{textoCupo}</p>
          <div className="cupo__barra">
            <span style={{ width: `${Math.round((usados / curso.cupo) * 100)}%` }} />
          </div>
        </div>
        {!compacta && (
          <Link
            className="boton boton--ambar boton--chico"
            to={`/inscripcion?curso=${encodeURIComponent(curso.slug)}`}
            aria-label={`Inscribirme en ${curso.nombre}`}
          >
            {lleno ? 'Anotarme en lista de espera' : 'Inscribirme'}
          </Link>
        )}
      </div>
    </article>
  )
}
