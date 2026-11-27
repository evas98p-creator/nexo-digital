import type { NuevaInscripcion } from '../types.ts'

/* Reglas de validación del formulario de inscripción.
   Las mismas reglas están repetidas como restricciones en la base
   de datos (supabase/migrations): el navegador avisa rápido, la
   base es la que realmente impide guardar datos inválidos. */

export const LIMITES = {
  curso: 60,
  nombre: 80,
  apellido: 80,
  email: 120,
  telefono: 40,
  profesion: 80,
  mensaje: 600,
} as const

export type Errores = Partial<Record<'nombre' | 'apellido' | 'email' | 'acepto', string>>

const CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function esCorreoValido(texto: string): boolean {
  return CORREO.test(texto.trim()) && texto.trim().length <= LIMITES.email
}

export function validarInscripcion(v: NuevaInscripcion, acepto: boolean): Errores {
  const errores: Errores = {}
  if (v.nombre.trim().length < 2) errores.nombre = 'Escribí tu nombre.'
  if (v.apellido.trim().length < 2) errores.apellido = 'Escribí tu apellido.'
  if (!esCorreoValido(v.email)) {
    errores.email = 'Escribí un correo válido, por ejemplo nombre@correo.com.'
  }
  if (!acepto) errores.acepto = 'Necesitamos tu aceptación para poder contactarte.'
  return errores
}

function limpiar(texto: string, max: number): string {
  return texto.trim().slice(0, max)
}

/** Deja solo los campos que acepta la tabla y recorta longitudes. */
export function normalizar(v: NuevaInscripcion) {
  return {
    curso: limpiar(v.curso, LIMITES.curso),
    nombre: limpiar(v.nombre, LIMITES.nombre),
    apellido: limpiar(v.apellido, LIMITES.apellido),
    email: limpiar(v.email, LIMITES.email).toLowerCase(),
    telefono: limpiar(v.telefono, LIMITES.telefono) || null,
    profesion: limpiar(v.profesion, LIMITES.profesion) || null,
    mensaje: limpiar(v.mensaje, LIMITES.mensaje) || null,
  }
}
