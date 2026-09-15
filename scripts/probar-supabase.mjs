// Prueba de punta a punta contra Supabase: cuentas, negocio, caja y aislamiento entre cuentas.
// Uso: node scripts/probar-supabase.mjs   (lee .env.local)
// Crea dos cuentas "pruebaescala…" que luego se pueden borrar en Authentication → Users.
import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { claveDeDocumento, correoDeApodo } from '../src/lib/cuenta.js'

const env = Object.fromEntries(
  fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/).filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)
const URL_SB = env.VITE_SUPABASE_URL
const CLAVE = env.VITE_SUPABASE_PUBLISHABLE_KEY
const nuevo = () => createClient(URL_SB, CLAVE, { auth: { persistSession: false, autoRefreshToken: false } })

let fallas = 0
const ok = (cond, texto, extra = '') => {
  console.log(`${cond ? '✔' : '✖'} ${texto}${extra ? ` → ${extra}` : ''}`)
  if (!cond) fallas++
}

const sufijo = Date.now().toString(36)
const cuentas = [
  { apodo: `Prueba Escala A ${sufijo}`, dni: '10000001' },
  { apodo: `Prueba Escala B ${sufijo}`, dni: '10000002' },
]

async function crear({ apodo, dni }) {
  const sb = nuevo()
  const { data, error } = await sb.auth.signUp({
    email: correoDeApodo(apodo),
    password: claveDeDocumento(dni),
    options: { data: { nickname: apodo, emprendimiento: 'Negocio de prueba' } },
  })
  return { sb, data, error }
}

// 1. Crear cuenta A
const a = await crear(cuentas[0])
ok(!a.error, 'Crear cuenta con correo interno', a.error ? `${a.error.code}: ${a.error.message}` : correoDeApodo(cuentas[0].apodo))
if (a.error) process.exit(1)
ok(!!a.data.session, 'La cuenta queda con sesión abierta (Confirm email desactivado)', a.data.session ? '' : 'sin sesión: desactiva Confirm email')
if (!a.data.session) process.exit(1)
const idA = a.data.user.id

// 2. Nombre repetido
const rep = await crear(cuentas[0])
ok(rep.error?.code === 'user_already_exists' || /already/i.test(rep.error?.message ?? ''), 'Nombre repetido se rechaza', rep.error?.code ?? 'no dio error')

// 3. Entrar con DNI equivocado / correcto
const malo = await nuevo().auth.signInWithPassword({ email: correoDeApodo(cuentas[0].apodo), password: claveDeDocumento('99999999') })
ok(malo.error?.code === 'invalid_credentials', 'DNI equivocado no entra', malo.error?.code)
const bueno = await nuevo().auth.signInWithPassword({ email: correoDeApodo(cuentas[0].apodo), password: claveDeDocumento(cuentas[0].dni) })
ok(!bueno.error, 'DNI correcto entra', bueno.error?.message)

// 4. Guardar negocio y movimientos (tablas del SQL)
const neg = await a.sb.from('negocios').upsert(
  { user_id: idA, nickname: cuentas[0].apodo, emprendimiento: 'Negocio de prueba', rubro: 'costura', datos: { hechos: { presupuesto: true } }, updated_at: new Date().toISOString() },
  { onConflict: 'user_id' },
)
ok(!neg.error, 'Guardar negocio', neg.error ? `${neg.error.code}: ${neg.error.message}` : '')
const neg2 = await a.sb.from('negocios').upsert(
  { user_id: idA, nickname: cuentas[0].apodo, emprendimiento: 'Negocio cambiado', rubro: 'costura', datos: {}, updated_at: new Date().toISOString() },
  { onConflict: 'user_id' },
)
ok(!neg2.error, 'Actualizar negocio', neg2.error?.message)
const mov = await a.sb.from('movimientos').insert({ fecha: '2026-09-15', tipo: 'entrada', concepto: 'Venta de prendas', unidades: 2, monto: 33 }).select('id')
ok(!mov.error, 'Guardar movimiento de caja', mov.error ? `${mov.error.code}: ${mov.error.message}` : '')
const leido = await a.sb.from('negocios').select('emprendimiento').eq('user_id', idA).maybeSingle()
ok(leido.data?.emprendimiento === 'Negocio cambiado', 'Leer mi negocio', JSON.stringify(leido.data ?? leido.error))

// 5. Aislamiento: la cuenta B no ve ni cambia lo de A
const b = await crear(cuentas[1])
ok(!!b.data?.session, 'Crear segunda cuenta', b.error?.message)
if (b.data?.session) {
  const verNeg = await b.sb.from('negocios').select('user_id')
  ok(!verNeg.error && verNeg.data.length === 0, 'Otra cuenta NO ve negocios ajenos', `ve ${verNeg.data?.length ?? verNeg.error?.message}`)
  const verMov = await b.sb.from('movimientos').select('id')
  ok(!verMov.error && verMov.data.length === 0, 'Otra cuenta NO ve movimientos ajenos', `ve ${verMov.data?.length ?? verMov.error?.message}`)
  const pisar = await b.sb.from('negocios').upsert({ user_id: idA, nickname: 'x', emprendimiento: 'hackeado', rubro: 'costura', datos: {} }, { onConflict: 'user_id' })
  ok(!!pisar.error, 'Otra cuenta NO puede escribir en negocio ajeno', pisar.error?.code ?? 'lo permitió')
  if (mov.data?.[0]) {
    await b.sb.from('movimientos').delete().eq('id', mov.data[0].id)
    const sigue = await a.sb.from('movimientos').select('id').eq('id', mov.data[0].id)
    ok(sigue.data?.length === 1, 'Otra cuenta NO puede borrar movimientos ajenos')
  }
}

// 6. Sin sesión no se ve nada
const anon = await nuevo().from('negocios').select('user_id')
ok(!anon.data?.length, 'Sin sesión no se ven datos', anon.error?.code ?? `ve ${anon.data?.length}`)

console.log(fallas ? `\n${fallas} prueba(s) fallaron` : '\nTodo bien')
console.log(`Cuentas de prueba creadas: ${cuentas.map((c) => correoDeApodo(c.apodo)).join(', ')}`)
process.exit(fallas ? 1 : 0)
