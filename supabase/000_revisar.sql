-- ESCALA · revisar qué hay en la base
-- Ejecutar en Supabase: SQL Editor → New query → pegar todo → Run.
-- No cambia nada: solo mira. Devuelve una fila por cosa, con ✅ o ❌.

with esperadas(tabla, script) as (
  values
    ('negocios', '001'),
    ('eventos', '002'),
    ('oportunidades', '003'), ('interesados', '003'), ('sobrantes', '003'),
    ('postulaciones', '003'), ('eco_jornadas', '003'), ('eco_entregas', '003'), ('eco_canjes', '003'),
    ('admins', '004')
)
select
  'tabla' as que,
  e.script,
  e.tabla as nombre,
  case when t.table_name is null then '❌ falta' else '✅' end as estado,
  coalesce((select count(*)::text from pg_policies p where p.schemaname = 'public' and p.tablename = e.tabla), '0') || ' políticas' as detalle
from esperadas e
left join information_schema.tables t
  on t.table_schema = 'public' and t.table_name = e.tabla

union all

select 'función', '004', f.nombre, case when p.proname is null then '❌ falta' else '✅' end, ''
from (values ('es_admin'), ('personas_del_equipo')) as f(nombre)
left join pg_proc p on p.proname = f.nombre
  and p.pronamespace = 'public'::regnamespace

union all

select 'columna', '003', c.tabla || '.' || c.columna,
  case when x.column_name is null then '❌ falta' else '✅' end, ''
from (values ('sobrantes', 'estado'), ('postulaciones', 'nota'), ('eco_canjes', 'estado')) as c(tabla, columna)
left join information_schema.columns x
  on x.table_schema = 'public' and x.table_name = c.tabla and x.column_name = c.columna

union all

select 'equipo', '004', 'cuentas admin', case when count(*) = 0 then '⚠️ ninguna' else '✅' end, count(*) || ' persona(s)'
from public.admins

order by 2, 1, 3;
