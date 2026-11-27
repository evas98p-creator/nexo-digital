export type Estado = 'pendiente' | 'contactado' | 'confirmado' | 'cancelado'

export const ESTADOS: { valor: Estado; nombre: string }[] = [
  { valor: 'pendiente', nombre: 'Pendiente' },
  { valor: 'contactado', nombre: 'Contactado' },
  { valor: 'confirmado', nombre: 'Confirmado' },
  { valor: 'cancelado', nombre: 'Cancelado' },
]

export interface Curso {
  /** Identificador interno. No cambiarlo si el curso ya tiene inscriptos. */
  slug: string
  nombre: string
  area: string
  resumen: string
  temas: string[]
  duracion: string
  inicio: string
  horario: string
  cupo: number
  /** Color que identifica al curso en fichas, panel y tabla. */
  tono: 'cielo' | 'vina' | 'ocre' | 'malbec'
}

/** Lo que completa una persona en el formulario público. */
export interface NuevaInscripcion {
  curso: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  profesion: string
  mensaje: string
}

/** Una fila de la tabla `inscripciones`. */
export interface Inscripcion {
  id: string
  creado_en: string
  curso: string
  nombre: string
  apellido: string
  email: string
  telefono: string | null
  profesion: string | null
  mensaje: string | null
  estado: Estado
}

export interface Sesion {
  email: string
}
