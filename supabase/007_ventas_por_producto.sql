-- ESCALA · saber de qué producto fue cada venta
-- Ejecutar en Supabase: SQL Editor → New query → pegar todo → Run.
-- Se puede volver a ejecutar sin miedo.
--
-- La caja ya deja elegir el producto al anotar una venta, pero solo lo guardaba
-- en el texto. Con esta columna se puede sumar por producto: cuál se vende más
-- y cuál deja más plata de verdad.
--
-- Es texto, no una llave: las fichas de producto viven dentro del jsonb del
-- negocio, no en una tabla aparte.

alter table public.movimientos add column if not exists producto_id text;

create index if not exists movimientos_producto on public.movimientos (negocio_id, producto_id);

-- Comprobar:
--   select producto_id, count(*), sum(monto) from public.movimientos
--   where tipo = 'entrada' and producto_id is not null group by 1 order by 3 desc;
