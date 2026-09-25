-- ESCALA · Escalemos y EcoEscala
-- Ejecutar en Supabase: SQL Editor → New query → pegar todo → Run.
--
-- Reglas: los datos privados del negocio siguen intactos y cerrados.
-- Aquí solo vive lo que la persona decide publicar, y siempre puede borrarlo.

-- ---------- Oportunidades (las publica el equipo desde este panel) ----------
create table public.oportunidades (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (char_length(titulo) between 3 and 90),
  detalle text not null check (char_length(detalle) between 3 and 600),
  tipo text not null default 'convocatoria',   -- feria | pedido | credito | taller | revista | convocatoria
  emoji text default '📣',
  lugar text,
  fecha_limite date,
  enlace text,
  activa boolean not null default true,
  creado_at timestamptz not null default now()
);
create index oportunidades_activas on public.oportunidades (activa, fecha_limite);

-- Quién se apuntó. Cada persona ve solo lo suyo; el equipo lo ve desde el panel.
create table public.interesados (
  id uuid primary key default gen_random_uuid(),
  oportunidad_id uuid not null references public.oportunidades (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text,
  emprendimiento text,
  creado_at timestamptz not null default now(),
  unique (oportunidad_id, user_id)
);

-- ---------- Sobrantes: lo que a uno le sobra, a otro le sirve ----------
create table public.sobrantes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('doy', 'busco')),
  titulo text not null check (char_length(titulo) between 3 and 80),
  detalle text check (char_length(detalle) <= 400),
  cantidad text,
  zona text,
  contacto text,                      -- WhatsApp que la persona decide mostrar
  foto text,                          -- imagen comprimida en el celular
  estado text not null default 'disponible' check (estado in ('disponible', 'entregado')),
  creado_at timestamptz not null default now()
);
create index sobrantes_estado on public.sobrantes (estado, creado_at desc);

-- ---------- Postulaciones a la revista ----------
create table public.postulaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  emprendimiento text not null,
  rubro text,
  que_vende text not null check (char_length(que_vende) between 3 and 300),
  historia text check (char_length(historia) <= 800),
  contacto text,
  foto text,
  estado text not null default 'enviada' check (estado in ('enviada', 'revision', 'seleccionada', 'no_seleccionada')),
  nota text,                          -- respuesta del equipo
  creado_at timestamptz not null default now(),
  unique (user_id)
);

-- ---------- EcoEscala ----------
create table public.eco_jornadas (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  hora text,
  lugar text not null,
  detalle text,
  activa boolean not null default true
);

-- Lo que cada persona entregó. Lo registra el equipo desde este panel.
create table public.eco_entregas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  material text not null,             -- plastico | carton | vidrio | metal | tela | papel
  kilos numeric(8, 2) not null check (kilos > 0),
  jornada_id uuid references public.eco_jornadas (id) on delete set null,
  creado_at timestamptz not null default now()
);

-- Canjes de puntos por premios (asesoría, diseño, taller, mención).
create table public.eco_canjes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  premio text not null,
  puntos integer not null check (puntos > 0),
  estado text not null default 'pedido' check (estado in ('pedido', 'entregado')),
  creado_at timestamptz not null default now()
);

-- ---------- Permisos ----------
alter table public.oportunidades enable row level security;
alter table public.interesados enable row level security;
alter table public.sobrantes enable row level security;
alter table public.postulaciones enable row level security;
alter table public.eco_jornadas enable row level security;
alter table public.eco_entregas enable row level security;
alter table public.eco_canjes enable row level security;

-- Oportunidades y jornadas: todos las leen, solo el equipo las escribe (desde el panel).
create policy "leer oportunidades" on public.oportunidades for select to authenticated using (activa);
create policy "leer jornadas" on public.eco_jornadas for select to authenticated using (activa);

-- Interesados: cada quien anota y ve lo suyo.
create policy "anotarme" on public.interesados for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "ver mis intereses" on public.interesados for select to authenticated using ((select auth.uid()) = user_id);
create policy "quitar mi interes" on public.interesados for delete to authenticated using ((select auth.uid()) = user_id);

-- Sobrantes: el tablero lo ve toda la red; cada quien manda sobre lo suyo.
create policy "ver el tablero" on public.sobrantes for select to authenticated using (true);
create policy "publicar lo mio" on public.sobrantes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "cambiar lo mio" on public.sobrantes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "borrar lo mio" on public.sobrantes for delete to authenticated using ((select auth.uid()) = user_id);

-- Postulaciones: privadas, solo la persona y el equipo (panel).
create policy "ver mi postulacion" on public.postulaciones for select to authenticated using ((select auth.uid()) = user_id);
create policy "postularme" on public.postulaciones for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "editar mi postulacion" on public.postulaciones for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- EcoEscala: cada quien ve sus entregas y sus canjes.
create policy "ver mis entregas" on public.eco_entregas for select to authenticated using ((select auth.uid()) = user_id);
create policy "ver mis canjes" on public.eco_canjes for select to authenticated using ((select auth.uid()) = user_id);
create policy "pedir premio" on public.eco_canjes for insert to authenticated with check ((select auth.uid()) = user_id);

grant select on public.oportunidades, public.eco_jornadas to authenticated;
grant select, insert, delete on public.interesados to authenticated;
grant select, insert, update, delete on public.sobrantes to authenticated;
grant select, insert, update on public.postulaciones to authenticated;
grant select on public.eco_entregas to authenticated;
grant select, insert on public.eco_canjes to authenticated;

-- ---------- Ejemplos para que no se vea vacío el primer día ----------
-- Bórralos o cámbialos desde Table Editor cuando tengas los reales.
insert into public.oportunidades (titulo, detalle, tipo, emoji, lugar, fecha_limite) values
  ('Feria de emprendedores', 'Tendremos un espacio con mesas para quienes quieran vender. Cupos limitados: apúntate y te escribimos con los detalles.', 'feria', '🎪', 'Plaza principal', current_date + 21),
  ('Convocatoria para la revista ESCALA', 'Buscamos 5 emprendimientos para la próxima edición. Necesitas fotos de tus productos y ganas de contar tu historia.', 'revista', '📰', null, current_date + 14);

insert into public.eco_jornadas (fecha, hora, lugar, detalle) values
  (current_date + 10, '9:00 a 13:00', 'Sede de la capacitación', 'Trae tu material limpio y separado: plástico, cartón, vidrio o metal. Lo pesamos y sumas puntos.');

-- Consultas útiles para el equipo:
--   select o.titulo, count(i.id) from oportunidades o left join interesados i on i.oportunidad_id = o.id group by 1;
--   select * from postulaciones where estado = 'enviada';
--   select user_id, sum(kilos) from eco_entregas group by 1 order by 2 desc;
