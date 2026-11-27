import { describe, expect, it } from 'vitest'
import { esCorreoValido, normalizar, validarInscripcion } from '../src/lib/validar.ts'
import type { NuevaInscripcion } from '../src/types.ts'

const base: NuevaInscripcion = {
  curso: 'ia-turismo', nombre: 'Ana', apellido: 'Sosa', email: 'ana@ejemplo.com',
  telefono: '', profesion: '', mensaje: '',
}

describe('validación del formulario', () => {
  it('acepta una inscripción completa', () => {
    expect(validarInscripcion(base, true)).toEqual({})
  })

  it('pide nombre, apellido, correo y aceptación', () => {
    const errores = validarInscripcion({ ...base, nombre: ' ', apellido: 'S', email: 'ana@' }, false)
    expect(Object.keys(errores).sort()).toEqual(['acepto', 'apellido', 'email', 'nombre'])
  })

  it('reconoce correos válidos e inválidos', () => {
    expect(esCorreoValido('  ana.sosa@estudio.com.ar ')).toBe(true)
    expect(esCorreoValido('ana sosa@estudio.com')).toBe(false)
    expect(esCorreoValido('ana@estudio')).toBe(false)
  })
})

describe('normalización antes de guardar', () => {
  it('recorta espacios, pasa el correo a minúsculas y deja vacíos como null', () => {
    const n = normalizar({ ...base, nombre: '  Ana ', email: ' ANA@Ejemplo.com ', telefono: '   ' })
    expect(n.nombre).toBe('Ana')
    expect(n.email).toBe('ana@ejemplo.com')
    expect(n.telefono).toBeNull()
  })

  it('recorta los textos al largo máximo de la tabla', () => {
    expect(normalizar({ ...base, mensaje: 'x'.repeat(900) }).mensaje).toHaveLength(600)
  })

  it('no deja pasar campos que la tabla no acepta', () => {
    const conExtra = { ...base, estado: 'confirmado' } as NuevaInscripcion
    expect(Object.keys(normalizar(conExtra))).not.toContain('estado')
  })
})
