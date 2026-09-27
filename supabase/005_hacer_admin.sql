-- ESCALA · dar (o quitar) acceso de equipo a una cuenta
-- Ejecutar en Supabase: SQL Editor → New query → pegar → Run.
-- Requiere haber ejecutado antes 004_equipo.sql.
--
-- No hace falta buscar ningún UID: se busca por el apodo con el que la persona
-- entra a la app. Se puede volver a ejecutar: si ya es admin, no pasa nada.
--
-- PASO 1: la persona crea su cuenta normal en la app (apodo + DNI). Sin eso no existe.
-- PASO 2: cambia el apodo de la línea de abajo por el suyo y dale Run.

insert into public.admins (user_id, nombre)
select n.user_id, n.nickname
from public.negocios n
where lower(trim(n.nickname)) = lower(trim('Marketing ESCALA'))   -- ← cambia esto
on conflict (user_id) do nothing;

-- Quiénes son del equipo hoy:
select a.nombre as apodo, n.emprendimiento, a.creado_at
from public.admins a
join public.negocios n on n.user_id = a.user_id
order by a.creado_at;

-- Si arriba no aparece nadie, el apodo no coincide. Mira cómo se escribió de verdad:
--   select nickname, emprendimiento from public.negocios order by created_at desc limit 20;

-- Para quitarle el acceso a alguien:
--   delete from public.admins
--   where user_id in (select user_id from public.negocios where lower(trim(nickname)) = lower(trim('Marketing ESCALA')));
