import { createClient } from '@supabase/supabase-js'
import type { Estado, Inscripcion, NuevaInscripcion, Sesion } from '../types.ts'
import { normalizar } from './validar.ts'

/* ============================================================
   CAPA DE DATOS
   Las pantallas nunca hablan directo con Supabase: usan `datos`.
   Hay dos implementaciones con las mismas funciones:
     - Supabase (en línea): cuando están las variables de entorno.
     - Demostración: datos ficticios guardados en el navegador.
       Es el prototipo de la Etapa 5 de la Clase 12.
   ============================================================ */

export type CodigoError = 'duplicado' | 'credenciales' | 'servidor'

export class ErrorDatos extends Error {
  codigo: CodigoError
  constructor(codigo: CodigoError, mensaje: string) {
    super(mensaje)
    this.name = 'ErrorDatos'
    this.codigo = codigo
  }
}

export interface Datos {
  modo: 'supabase' | 'demo'
  crearInscripcion(d: NuevaInscripcion): Promise<void>
  /** Inscriptos no cancelados por curso (slug -> cantidad). */
  ocupacion(): Promise<Record<string, number>>
  sesion(): Promise<Sesion | null>
  iniciarSesion(email: string, clave: string): Promise<Sesion>
  cerrarSesion(): Promise<void>
  esAdmin(): Promise<boolean>
  listar(): Promise<Inscripcion[]>
  cambiarEstado(id: string, estado: Estado): Promise<void>
  eliminar(id: string): Promise<void>
}

/* ---------------------------------------------------------
   Implementación en línea: Supabase
   Usa solo la URL y la clave publicable. Lo que cada persona
   puede leer o modificar lo decide la base (políticas RLS).
   --------------------------------------------------------- */
export function crearDatosSupabase(url: string, clavePublicable: string): Datos {
  const sb = createClient(url, clavePublicable)

  function revisar<T>(res: { data: T; error: { code?: string; message: string } | null }): T {
    if (res.error) {
      if (res.error.code === '23505') {
        throw new ErrorDatos('duplicado', 'Ya hay una inscripción con ese correo en este curso.')
      }
      throw new ErrorDatos('servidor', res.error.message)
    }
    return res.data
  }

  return {
    modo: 'supabase',

    async crearInscripcion(d) {
      revisar(await sb.from('inscripciones').insert(normalizar(d)))
    },

    async ocupacion() {
      const filas =
        (revisar(await sb.rpc('ocupacion_por_curso')) as { curso: string; inscriptos: number }[] | null) ?? []
      const mapa: Record<string, number> = {}
      for (const f of filas) mapa[f.curso] = Number(f.inscriptos) || 0
      return mapa
    },

    async sesion() {
      const { data } = await sb.auth.getSession()
      const email = data.session?.user.email
      return email ? { email } : null
    },

    async iniciarSesion(email, clave) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password: clave })
      if (error || !data.user) {
        throw new ErrorDatos('credenciales', 'El correo o la contraseña no coinciden.')
      }
      return { email: data.user.email ?? email }
    },

    async cerrarSesion() {
      await sb.auth.signOut()
    },

    async esAdmin() {
      return revisar(await sb.rpc('es_admin')) === true
    },

    async listar() {
      const filas = revisar(
        await sb.from('inscripciones').select('*').order('creado_en', { ascending: false }),
      )
      return (filas ?? []) as Inscripcion[]
    },

    async cambiarEstado(id, estado) {
      revisar(await sb.from('inscripciones').update({ estado }).eq('id', id))
    },

    async eliminar(id) {
      revisar(await sb.from('inscripciones').delete().eq('id', id))
    },
  }
}

/* ---------------------------------------------------------
   Implementación de demostración: datos ficticios
   --------------------------------------------------------- */
const CLAVE = 'nexo-demo-inscripciones'
const CLAVE_SESION = 'nexo-demo-sesion'
const SESION_DEMO: Sesion = { email: 'demo@nexodigital' }

function almacen(tipo: 'localStorage' | 'sessionStorage'): Storage | null {
  try {
    return typeof window !== 'undefined' ? window[tipo] : null
  } catch {
    return null
  }
}

export function inscripcionesDeEjemplo(): Inscripcion[] {
  const ahora = Date.now()
  const dia = 86_400_000
  const base: [string, string, string, string, string, string, Estado, number][] = [
    ['ia-contadores', 'Marina', 'Quiroga', 'marina.quiroga@ejemplo.com', '261 555 0101', 'Contadora', 'confirmado', 6],
    ['ia-desde-cero', 'Tomás', 'Benegas', 'tomas.benegas@ejemplo.com', '261 555 0102', 'Administrador', 'contactado', 5],
    ['ia-aduanas', 'Lucía', 'Ferreyra', 'lucia.ferreyra@ejemplo.com', '261 555 0103', 'Despachante de aduana', 'pendiente', 3],
    ['ia-turismo', 'Germán', 'Olmos', 'german.olmos@ejemplo.com', '', 'Lic. en Turismo', 'pendiente', 2],
    ['ia-contadores', 'Paula', 'Zárate', 'paula.zarate@ejemplo.com', '261 555 0105', 'Estudiante de Contabilidad', 'pendiente', 1],
    ['ia-desde-cero', 'Raúl', 'Montenegro', 'raul.montenegro@ejemplo.com', '261 555 0106', 'Comerciante', 'cancelado', 1],
  ]
  return base.map((b, i) => ({
    id: `demo-${i + 1}`,
    curso: b[0],
    nombre: b[1],
    apellido: b[2],
    email: b[3],
    telefono: b[4] || null,
    profesion: b[5],
    mensaje: null,
    estado: b[6],
    creado_en: new Date(ahora - b[7] * dia - i * 3_600_000).toISOString(),
  }))
}

export function crearDatosDemo(): Datos {
  let memoria: Inscripcion[] | null = null // respaldo si no hay localStorage
  let sesionMemoria = false

  function leer(): Inscripcion[] {
    if (memoria) return memoria
    const crudo = almacen('localStorage')?.getItem(CLAVE)
    if (crudo) {
      try {
        memoria = JSON.parse(crudo) as Inscripcion[]
        return memoria
      } catch {
        /* dato dañado: se vuelve a los ejemplos */
      }
    }
    return guardar(inscripcionesDeEjemplo())
  }

  function guardar(filas: Inscripcion[]): Inscripcion[] {
    memoria = filas
    try {
      almacen('localStorage')?.setItem(CLAVE, JSON.stringify(filas))
    } catch {
      /* sin espacio o sin permiso: queda en memoria */
    }
    return filas
  }

  return {
    modo: 'demo',

    async crearInscripcion(d) {
      const n = normalizar(d)
      const filas = leer()
      if (filas.some((f) => f.email === n.email && f.curso === n.curso)) {
        throw new ErrorDatos('duplicado', 'Ya hay una inscripción con ese correo en este curso.')
      }
      guardar([
        { ...n, id: `demo-${Date.now()}`, estado: 'pendiente', creado_en: new Date().toISOString() },
        ...filas,
      ])
    },

    async ocupacion() {
      const mapa: Record<string, number> = {}
      for (const f of leer()) {
        if (f.estado !== 'cancelado') mapa[f.curso] = (mapa[f.curso] ?? 0) + 1
      }
      return mapa
    },

    async sesion() {
      const activa = sesionMemoria || almacen('sessionStorage')?.getItem(CLAVE_SESION) === '1'
      return activa ? SESION_DEMO : null
    },

    async iniciarSesion() {
      sesionMemoria = true
      almacen('sessionStorage')?.setItem(CLAVE_SESION, '1')
      return SESION_DEMO
    },

    async cerrarSesion() {
      sesionMemoria = false
      almacen('sessionStorage')?.removeItem(CLAVE_SESION)
    },

    async esAdmin() {
      return true
    },

    async listar() {
      return [...leer()].sort((a, b) => (a.creado_en < b.creado_en ? 1 : -1))
    },

    async cambiarEstado(id, estado) {
      guardar(leer().map((f) => (f.id === id ? { ...f, estado } : f)))
    },

    async eliminar(id) {
      guardar(leer().filter((f) => f.id !== id))
    },
  }
}

/* ---------------------------------------------------------
   Elección automática según las variables de entorno
   --------------------------------------------------------- */
export function estaConfigurado(url: string | undefined, clave: string | undefined): boolean {
  return (
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test((url ?? '').trim()) &&
    (clave ?? '').trim().length > 20 &&
    !(clave ?? '').includes('xxxx')
  )
}

const url = import.meta.env.VITE_SUPABASE_URL
const clave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const datos: Datos = estaConfigurado(url, clave)
  ? crearDatosSupabase(url!.trim().replace(/\/$/, ''), clave!.trim())
  : crearDatosDemo()
