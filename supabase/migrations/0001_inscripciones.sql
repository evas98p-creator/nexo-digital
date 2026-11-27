-- ============================================================
-- NEXO DIGITAL · Migración 0001 · Inscripciones
-- Pegar COMPLETO en Supabase > SQL Editor y tocar "Run".
-- Se puede ejecutar más de una vez sin romper nada.
--
-- Principios (Clase 12):
--   * RLS habilitado en todas las tablas.
--   * Mínimo privilegio: cada rol recibe solo lo que necesita.
--   * Los permisos se comprueban en la base, no en la pantalla.
--   * Las validaciones del formulario se repiten como restricciones.
-- ============================================================

-- ---------- 1. Tablas ----------
create table if not exists public.inscripciones (
  id         uuid primary key default gen_random_uuid(),
  creado_en  timestamptz not null default now(),
  curso      text not null check (curso ~ '^[a-z0-9-]{2,60}$'),
  nombre     text not null check (char_length(nombre) between 2 and 80),
  apellido   text not null check (char_length(apellido) between 2 and 80),
  email      text not null check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
                                  and char_length(email) <= 120),
  telefono   text check (char_length(telefono) <= 40),
  profesion  text check (char_length(profesion) <= 80),
  mensaje    text check (char_length(mensaje) <= 600),
  estado     text not null default 'pendiente'
             check (estado in ('pendiente', 'contactado', 'confirmado', 'cancelado'))
);

-- Una misma persona no puede inscribirse dos veces al mismo curso.
create unique index if not exists inscripciones_email_curso_unico
  on public.inscripciones (lower(email), curso);

create index if not exists inscripciones_creado_en_idx
  on public.inscripciones (creado_en desc);

-- Quiénes pueden entrar al panel. Se carga con 0002_administradora.sql.
create table if not exists public.admins (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  creado_en timestamptz not null default now()
);

-- ---------- 2. Funciones ----------
-- ¿La persona que hace la consulta es administradora?
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = (select auth.uid())
  );
$$;

-- Lugares ocupados por curso. Devuelve solo cantidades, nunca datos personales.
create or replace function public.ocupacion_por_curso()
returns table (curso text, inscriptos bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select i.curso, count(*)
  from public.inscripciones i
  where i.estado <> 'cancelado'
  group by i.curso;
$$;

-- ---------- 3. Seguridad a nivel de filas (RLS) ----------
alter table public.inscripciones enable row level security;
alter table public.admins enable row level security;
-- "admins" no tiene políticas: nadie la lee ni la modifica desde la aplicación.

drop policy if exists "Cualquier persona puede inscribirse" on public.inscripciones;
create policy "Cualquier persona puede inscribirse"
  on public.inscripciones for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Solo administradoras leen inscripciones" on public.inscripciones;
create policy "Solo administradoras leen inscripciones"
  on public.inscripciones for select
  to authenticated
  using ((select public.es_admin()));

drop policy if exists "Solo administradoras cambian el estado" on public.inscripciones;
create policy "Solo administradoras cambian el estado"
  on public.inscripciones for update
  to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

drop policy if exists "Solo administradoras eliminan inscripciones" on public.inscripciones;
create policy "Solo administradoras eliminan inscripciones"
  on public.inscripciones for delete
  to authenticated
  using ((select public.es_admin()));

-- ---------- 4. Permisos explícitos (mínimo privilegio) ----------
revoke all on table public.inscripciones from anon, authenticated;
revoke all on table public.admins from anon, authenticated;

-- El formulario público solo puede escribir estas columnas:
-- no puede fijar el estado, la fecha ni el identificador.
grant insert (curso, nombre, apellido, email, telefono, profesion, mensaje)
  on table public.inscripciones to anon, authenticated;

-- El panel lee y elimina filas, y solo puede modificar la columna "estado".
grant select, delete on table public.inscripciones to authenticated;
grant update (estado) on table public.inscripciones to authenticated;

revoke all on function public.es_admin() from public, anon, authenticated;
revoke all on function public.ocupacion_por_curso() from public, anon, authenticated;
grant execute on function public.es_admin() to authenticated;
grant execute on function public.ocupacion_por_curso() to anon, authenticated;
