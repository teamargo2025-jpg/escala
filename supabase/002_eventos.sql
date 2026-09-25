-- ESCALA · conteo anónimo de uso (opcional, para el piloto)
-- Ejecutar en Supabase: SQL Editor → New query → pegar todo → Run.
--
-- No guarda datos personales: un identificador al azar del celular, el nombre del evento y el rubro.
-- Nadie puede leer la tabla desde la app: se consulta desde el panel de Supabase.

create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  sesion text not null check (char_length(sesion) between 4 and 64),
  evento text not null check (char_length(evento) between 2 and 60),
  rubro text,
  creado_at timestamptz not null default now()
);
create index eventos_evento_fecha on public.eventos (evento, creado_at desc);

alter table public.eventos enable row level security;

-- Solo se puede escribir; leer, solo desde el panel.
create policy "cualquiera anota" on public.eventos for insert to anon, authenticated with check (true);

grant insert on public.eventos to anon, authenticated;

-- Consultas útiles durante el piloto:
--   select evento, count(*) from eventos where creado_at > now() - interval '1 day' group by evento order by 2 desc;
--   select count(distinct sesion) from eventos where evento = 'cuenta_creada';
--   select count(distinct sesion) from eventos where evento = 'plan_completo';
