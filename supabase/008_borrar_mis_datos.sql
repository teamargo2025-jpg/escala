-- ESCALA · que cada persona pueda borrar lo suyo
-- Ejecutar en Supabase: SQL Editor → New query → pegar todo → Run.
-- Se puede volver a ejecutar sin miedo.
--
-- La política de privacidad promete que uno puede ver, corregir y borrar sus datos
-- (Ley 29733). Para eso faltaban permisos de borrado en tres tablas: sin esto, la
-- app puede prometerlo pero no cumplirlo.

drop policy if exists "borrar mi postulacion" on public.postulaciones;
create policy "borrar mi postulacion" on public.postulaciones
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "borrar mis canjes" on public.eco_canjes;
create policy "borrar mis canjes" on public.eco_canjes
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Las entregas de material las registra el equipo, pero son datos de la persona.
drop policy if exists "borrar mis entregas" on public.eco_entregas;
create policy "borrar mis entregas" on public.eco_entregas
  for delete to authenticated using ((select auth.uid()) = user_id);

grant delete on public.postulaciones to authenticated;
grant delete on public.eco_canjes to authenticated;
grant delete on public.eco_entregas to authenticated;

-- Los movimientos de caja se borran solos al borrar el negocio (on delete cascade),
-- igual que los intereses y los sobrantes al borrar la cuenta.

-- Comprobar qué le queda a una persona:
--   select 'negocios' t, count(*) from public.negocios where user_id = 'UID'
--   union all select 'movimientos', count(*) from public.movimientos m
--     join public.negocios n on n.id = m.negocio_id where n.user_id = 'UID';
