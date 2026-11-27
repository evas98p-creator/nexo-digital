import { describe, expect, it } from 'vitest'
import { ErrorDatos, crearDatosDemo, estaConfigurado } from '../src/lib/datos.ts'

const nueva = {
  curso: 'ia-aduanas', nombre: 'Ana', apellido: 'Sosa', email: 'ana@ejemplo.com',
  telefono: '', profesion: '', mensaje: '',
}

describe('prototipo con datos ficticios (modo demostración)', () => {
  it('arranca con inscripciones de ejemplo', async () => {
    expect(await crearDatosDemo().listar()).toHaveLength(6)
  })

  it('guarda una inscripción nueva como pendiente y la muestra primera', async () => {
    const d = crearDatosDemo()
    await d.crearInscripcion(nueva)
    const [primera] = await d.listar()
    expect(primera).toMatchObject({ email: 'ana@ejemplo.com', estado: 'pendiente' })
  })

  it('rechaza la inscripción repetida', async () => {
    const d = crearDatosDemo()
    await d.crearInscripcion(nueva)
    await expect(d.crearInscripcion({ ...nueva, email: 'ANA@ejemplo.com' })).rejects.toBeInstanceOf(ErrorDatos)
  })

  it('cuenta los lugares ocupados sin las canceladas', async () => {
    const d = crearDatosDemo()
    expect(await d.ocupacion()).toEqual({
      'ia-contadores': 2, 'ia-desde-cero': 1, 'ia-aduanas': 1, 'ia-turismo': 1,
    })
  })

  it('cambia el estado y elimina', async () => {
    const d = crearDatosDemo()
    await d.cambiarEstado('demo-3', 'confirmado')
    await d.eliminar('demo-4')
    const filas = await d.listar()
    expect(filas.find((f) => f.id === 'demo-3')?.estado).toBe('confirmado')
    expect(filas.some((f) => f.id === 'demo-4')).toBe(false)
  })
})

describe('detección de la configuración de Supabase', () => {
  it('sin variables usa el modo demostración', () => {
    expect(estaConfigurado(undefined, undefined)).toBe(false)
    expect(estaConfigurado('https://TU-PROYECTO.supabase.co', 'sb_publishable_xxxxxxxxxxxxxxxx')).toBe(false)
  })

  it('con URL y clave publicable usa Supabase', () => {
    expect(estaConfigurado('https://abcdefghij.supabase.co', 'sb_publishable_1234567890abcdefghij')).toBe(true)
  })
})
