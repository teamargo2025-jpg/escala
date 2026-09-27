-- ESCALA · cuentas de equipo (admin)
-- Ejecutar en Supabase: SQL Editor → New query → pegar todo → Run.
-- Requiere haber ejecutado antes 001 y 003.
--
-- Quién es del equipo se decide aquí, no en la app: se agrega una fila a `admins`.
-- Un admin ve los interesados, las postulaciones y puede registrar los kilos de EcoEscala.
-- Lo que NUNCA ve: los números privados del negocio de cada persona.

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  creado_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- Función de apoyo: evita que las políticas se consulten a sí mismas.
create or replace function public.es_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;
grant execute on function public.es_admin() to authenticated;

create policy "ver si soy del equipo" on public.admins for select to authenticated using ((select auth.uid()) = user_id);

-- Solo nombre, emprendimiento y rubro: los números del negocio no se exponen nunca.
create or replace function public.personas_del_equipo()
returns table (user_id uuid, nickname text, emprendimiento text, rubro text)
language sql
security definer
stable
set search_path = public
as $$
  select n.user_id, n.nickname, n.emprendimiento, n.rubro
  from public.negocios n
  where public.es_admin()
  order by n.nickname;
$$;
grant execute on function public.personas_del_equipo() to authenticated;

-- ---------- Lo que puede hacer el equipo ----------
create policy "equipo ve interesados" on public.interesados for select to authenticated using (public.es_admin());
create policy "equipo ve postulaciones" on public.postulaciones for select to authenticated using (public.es_admin());
create policy "equipo responde postulaciones" on public.postulaciones for update to authenticated using (public.es_admin()) with check (public.es_admin());

create policy "equipo publica oportunidades" on public.oportunidades for insert to authenticated with check (public.es_admin());
create policy "equipo edita oportunidades" on public.oportunidades for update to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "equipo ve todas las oportunidades" on public.oportunidades for select to authenticated using (public.es_admin());

create policy "equipo publica jornadas" on public.eco_jornadas for insert to authenticated with check (public.es_admin());
create policy "equipo edita jornadas" on public.eco_jornadas for update to authenticated using (public.es_admin()) with check (public.es_admin());

create policy "equipo registra entregas" on public.eco_entregas for insert to authenticated with check (public.es_admin());
create policy "equipo ve entregas" on public.eco_entregas for select to authenticated using (public.es_admin());

create policy "equipo ve canjes" on public.eco_canjes for select to authenticated using (public.es_admin());
create policy "equipo entrega canjes" on public.eco_canjes for update to authenticated using (public.es_admin()) with check (public.es_admin());

create policy "equipo modera sobrantes" on public.sobrantes for delete to authenticated using (public.es_admin());

grant insert, update on public.oportunidades to authenticated;
grant insert, update on public.eco_jornadas to authenticated;
grant insert on public.eco_entregas to authenticated;
grant update on public.eco_canjes to authenticated;
grant update on public.postulaciones to authenticated;
grant select on public.admins to authenticated;

-- ---------- Cómo agregar a alguien del equipo ----------
-- 1) Esa persona crea su cuenta normal en la app (nombre + DNI).
-- 2) Busca su id en Authentication → Users (columna UID) y pégalo aquí:
--
-- insert into public.admins (user_id, nombre) values ('PEGA-EL-UID-AQUI', 'Marketing ESCALA');
--
-- Para quitarle el acceso: delete from public.admins where user_id = 'EL-UID';
