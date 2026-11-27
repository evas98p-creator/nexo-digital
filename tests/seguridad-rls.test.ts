/* Pruebas de seguridad de la base de datos.
   Levantan un PostgreSQL real en memoria (PGlite), ejecutan las mismas
   migraciones que se pegan en Supabase y comprueban qué puede hacer cada rol:
     - anon:          visitante del sitio, sin sesión.
     - authenticated: persona con sesión iniciada (administradora o no). */
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'

const ADMIN = '11111111-1111-1111-1111-111111111111'
const INTRUSA = '22222222-2222-2222-2222-222222222222'

let db: PGlite

/** Ejecuta una consulta como lo haría Supabase para ese rol y usuario. */
function como(rol: 'anon' | 'authenticated', usuario: string | null, sql: string) {
  return db.transaction(async (tx) => {
    await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [usuario ?? ''])
    await tx.exec(`set local role ${rol}`)
    return tx.query<Record<string, unknown>>(sql)
  })
}

const ALTA = `insert into public.inscripciones (curso, nombre, apellido, email)
              values ('ia-turismo', 'Ana', 'Sosa', 'ana.sosa@ejemplo.com')`

beforeAll(async () => {
  db = new PGlite()
  // Lo mínimo que Supabase ya trae creado: roles y esquema de autenticación.
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth, public to anon, authenticated;
    insert into auth.users values
      ('${ADMIN}', 'admin@nexodigital.test'), ('${INTRUSA}', 'otra@persona.test');
  `)
  await db.exec(readFileSync('supabase/migrations/0001_inscripciones.sql', 'utf8'))
  // Se ejecuta dos veces: la migración tiene que poder repetirse.
  await db.exec(readFileSync('supabase/migrations/0001_inscripciones.sql', 'utf8'))
})

describe('alta de la administradora (migración 0002)', () => {
  const sql = readFileSync('supabase/migrations/0002_administradora.sql', 'utf8')

  it('falla con un mensaje claro si el correo no existe', async () => {
    await expect(db.exec(sql)).rejects.toThrow(/No existe un usuario/)
  })

  it('registra a la administradora cuando el correo existe', async () => {
    await db.exec(sql.replace('CAMBIAR-POR-TU-CORREO@ejemplo.com', 'Admin@NexoDigital.test'))
    const { rows } = await db.query('select user_id from public.admins')
    expect(rows).toEqual([{ user_id: ADMIN }])
  })
})

describe('visitante sin sesión (anon)', () => {
  it('puede inscribirse', async () => {
    await expect(como('anon', null, ALTA)).resolves.toBeDefined()
  })

  it('no puede inscribirse dos veces al mismo curso con el mismo correo', async () => {
    await expect(
      como('anon', null, ALTA.replace('ana.sosa@ejemplo.com', 'ANA.SOSA@ejemplo.com')),
    ).rejects.toMatchObject({ code: '23505' })
  })

  it('no puede leer las inscripciones', async () => {
    await expect(como('anon', null, 'select * from public.inscripciones')).rejects.toThrow(/permission denied/)
  })

  it('no puede fijar el estado de su propia inscripción', async () => {
    await expect(
      como('anon', null, `insert into public.inscripciones (curso, nombre, apellido, email, estado)
                          values ('ia-turismo', 'Eva', 'Paz', 'eva@ejemplo.com', 'confirmado')`),
    ).rejects.toThrow(/permission denied/)
  })

  it('no puede modificar ni eliminar inscripciones', async () => {
    await expect(como('anon', null, `update public.inscripciones set estado = 'confirmado'`)).rejects.toThrow(/permission denied/)
    await expect(como('anon', null, 'delete from public.inscripciones')).rejects.toThrow(/permission denied/)
  })

  it('no puede guardar datos inválidos', async () => {
    await expect(
      como('anon', null, `insert into public.inscripciones (curso, nombre, apellido, email)
                          values ('ia-turismo', 'Ana', 'Sosa', 'esto-no-es-un-correo')`),
    ).rejects.toThrow(/check constraint/)
    await expect(
      como('anon', null, `insert into public.inscripciones (curso, nombre, apellido, email)
                          values ('ia-turismo', 'A', 'Sosa', 'a@ejemplo.com')`),
    ).rejects.toThrow(/check constraint/)
  })

  it('ve cuántos lugares hay ocupados, sin datos personales', async () => {
    const { rows } = await como('anon', null, 'select * from public.ocupacion_por_curso()')
    expect(rows).toEqual([{ curso: 'ia-turismo', inscriptos: 1 }])
  })

  it('no puede leer la lista de administradoras ni preguntar quién lo es', async () => {
    await expect(como('anon', null, 'select * from public.admins')).rejects.toThrow(/permission denied/)
    await expect(como('anon', null, 'select public.es_admin()')).rejects.toThrow(/permission denied/)
  })
})

describe('persona con sesión que NO es administradora', () => {
  it('no ve ninguna inscripción', async () => {
    const { rows } = await como('authenticated', INTRUSA, 'select * from public.inscripciones')
    expect(rows).toHaveLength(0)
  })

  it('no puede modificar ni eliminar inscripciones', async () => {
    const cambio = await como('authenticated', INTRUSA, `update public.inscripciones set estado = 'confirmado'`)
    expect(cambio.affectedRows).toBe(0)
    const baja = await como('authenticated', INTRUSA, 'delete from public.inscripciones')
    expect(baja.affectedRows).toBe(0)
  })

  it('no puede agregarse como administradora', async () => {
    await expect(
      como('authenticated', INTRUSA, `insert into public.admins (user_id) values ('${INTRUSA}')`),
    ).rejects.toThrow(/permission denied/)
  })

  it('la base le responde que no es administradora', async () => {
    const { rows } = await como('authenticated', INTRUSA, 'select public.es_admin() as es')
    expect(rows[0].es).toBe(false)
  })
})

describe('administradora', () => {
  it('la base la reconoce como administradora', async () => {
    const { rows } = await como('authenticated', ADMIN, 'select public.es_admin() as es')
    expect(rows[0].es).toBe(true)
  })

  it('lee las inscripciones', async () => {
    const { rows } = await como('authenticated', ADMIN, 'select nombre, estado from public.inscripciones')
    expect(rows).toEqual([{ nombre: 'Ana', estado: 'pendiente' }])
  })

  it('puede cambiar el estado, pero no los datos de la persona', async () => {
    const cambio = await como('authenticated', ADMIN, `update public.inscripciones set estado = 'confirmado'`)
    expect(cambio.affectedRows).toBe(1)
    await expect(
      como('authenticated', ADMIN, `update public.inscripciones set email = 'otro@ejemplo.com'`),
    ).rejects.toThrow(/permission denied/)
  })

  it('no puede usar un estado que no existe', async () => {
    await expect(
      como('authenticated', ADMIN, `update public.inscripciones set estado = 'aprobado'`),
    ).rejects.toThrow(/check constraint/)
  })

  it('una inscripción cancelada libera el lugar', async () => {
    await como('authenticated', ADMIN, `update public.inscripciones set estado = 'cancelado'`)
    const { rows } = await como('anon', null, 'select * from public.ocupacion_por_curso()')
    expect(rows).toHaveLength(0)
  })

  it('puede eliminar una inscripción', async () => {
    const baja = await como('authenticated', ADMIN, 'delete from public.inscripciones')
    expect(baja.affectedRows).toBe(1)
  })
})
