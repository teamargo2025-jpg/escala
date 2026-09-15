-- ESCALA · esquema inicial
-- Ejecutar una vez en Supabase: SQL Editor → New query → pegar todo → Run.
--
-- Las cuentas usan Supabase Auth: el apodo se convierte en un correo interno
-- (nunca se envían correos) y el DNI es la contraseña. Supabase guarda la
-- contraseña cifrada; el DNI no se guarda en ninguna tabla.

-- Un negocio por persona: perfil + números de los apartados.
create table public.negocios (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 40),
  emprendimiento text not null check (char_length(emprendimiento) between 2 and 60),
  rubro text not null,
  datos jsonb not null default '{}'::jsonb,
  acepto_datos_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Control de caja: lo que entra y sale de verdad.
create table public.movimientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fecha date not null default current_date,
  tipo text not null check (tipo in ('entrada', 'salida')),
  concepto text not null check (char_length(concepto) between 1 and 80),
  unidades integer check (unidades is null or unidades >= 0),
  monto numeric(12, 2) not null check (monto >= 0),
  created_at timestamptz not null default now()
);
create index movimientos_user_fecha on public.movimientos (user_id, fecha desc);

-- Cada persona solo ve y cambia lo suyo.
alter table public.negocios enable row level security;
alter table public.movimientos enable row level security;

create policy "negocio propio: leer" on public.negocios
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "negocio propio: crear" on public.negocios
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "negocio propio: cambiar" on public.negocios
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "caja propia: leer" on public.movimientos
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "caja propia: crear" on public.movimientos
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "caja propia: borrar" on public.movimientos
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update on public.negocios to authenticated;
grant select, insert, delete on public.movimientos to authenticated;
