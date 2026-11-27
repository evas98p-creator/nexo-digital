-- ============================================================
-- NEXO DIGITAL · Migración 0002 · Alta de la administradora
--
-- ANTES de ejecutar:
--   1. Crear el usuario en Supabase > Authentication > Users >
--      "Add user" (correo y contraseña).
--   2. Reemplazar abajo el correo de ejemplo por ese mismo correo.
-- ============================================================
do $$
declare
  correo text := 'CAMBIAR-POR-TU-CORREO@ejemplo.com';
  encontrados integer;
begin
  insert into public.admins (user_id)
  select u.id from auth.users u where lower(u.email) = lower(correo)
  on conflict (user_id) do nothing;

  select count(*) into encontrados
  from public.admins a join auth.users u on u.id = a.user_id
  where lower(u.email) = lower(correo);

  if encontrados = 0 then
    raise exception 'No existe un usuario con el correo %. Crealo primero en Authentication > Users.', correo;
  end if;
end $$;
