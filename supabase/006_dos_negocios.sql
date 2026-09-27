-- ESCALA · dos emprendimientos en una misma cuenta
-- Ejecutar en Supabase: SQL Editor → New query → pegar todo → Run.
-- Se puede volver a ejecutar sin miedo: lo que ya está hecho se salta.
--
-- Antes: una fila de `negocios` por persona (user_id era la llave).
-- Ahora: cada negocio tiene su propio id y una persona puede tener más de uno.
-- Los datos que ya existen NO se tocan: cada fila recibe su id y sigue igual.

-- ---------- negocios: su propia llave ----------
alter table public.negocios add column if not exists id uuid not null default gen_random_uuid();

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'negocios_pkey' and conrelid = 'public.negocios'::regclass
      and array_length(conkey, 1) = 1
      and conkey[1] = (select attnum from pg_attribute where attrelid = 'public.negocios'::regclass and attname = 'user_id')
  ) then
    alter table public.negocios drop constraint negocios_pkey;
    alter table public.negocios add constraint negocios_pkey primary key (id);
  end if;
end $$;

create index if not exists negocios_user on public.negocios (user_id, created_at);

-- ---------- movimientos: a qué negocio pertenece cada uno ----------
alter table public.movimientos add column if not exists negocio_id uuid references public.negocios (id) on delete cascade;

-- Los movimientos que ya existían son del único negocio que tenía esa persona.
update public.movimientos m
set negocio_id = n.id
from public.negocios n
where m.negocio_id is null and n.user_id = m.user_id;

create index if not exists movimientos_negocio_fecha on public.movimientos (negocio_id, fecha desc);

-- ---------- Permisos ----------
-- Las políticas siguen siendo por persona: nadie ve la caja de otro.
-- Se vuelven a crear por si quedaron a medias en una ejecución anterior.
drop policy if exists "negocio propio: leer" on public.negocios;
create policy "negocio propio: leer" on public.negocios
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "negocio propio: crear" on public.negocios;
create policy "negocio propio: crear" on public.negocios
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "negocio propio: cambiar" on public.negocios;
create policy "negocio propio: cambiar" on public.negocios
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Borrar un emprendimiento: solo el dueño, y solo si le queda otro.
-- (La app no lo ofrece todavía; la política queda lista.)
drop policy if exists "negocio propio: borrar" on public.negocios;
create policy "negocio propio: borrar" on public.negocios
  for delete to authenticated using ((select auth.uid()) = user_id);
grant delete on public.negocios to authenticated;

-- ---------- El panel del equipo sigue viendo una fila por persona ----------
-- Los puntos de EcoEscala son de la persona, no del emprendimiento: si alguien
-- tiene dos, se muestran juntos en la misma fila.
create or replace function public.personas_del_equipo()
returns table (user_id uuid, nickname text, emprendimiento text, rubro text)
language sql
security definer
stable
set search_path = public
as $$
  select n.user_id,
         min(n.nickname) as nickname,
         string_agg(n.emprendimiento, ' · ' order by n.created_at) as emprendimiento,
         min(n.rubro) as rubro
  from public.negocios n
  where public.es_admin()
  group by n.user_id
  order by 2;
$$;
grant execute on function public.personas_del_equipo() to authenticated;

-- ---------- Comprobar ----------
-- Cuántos negocios tiene cada persona y si quedó algún movimiento suelto:
--   select user_id, count(*) from public.negocios group by 1 having count(*) > 1;
--   select count(*) as movimientos_sin_negocio from public.movimientos where negocio_id is null;
