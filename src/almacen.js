// Dónde viven los datos. Con las variables de Supabase configuradas usa Supabase;
// sin ellas, un "modo prueba" que guarda todo en este navegador (para desarrollo).
import { createClient } from '@supabase/supabase-js'
import { claveApodo, claveDeDocumento, correoDeApodo, limpiarTexto } from './lib/cuenta.js'

const URL_SUPABASE = import.meta.env.VITE_SUPABASE_URL
const CLAVE_PUBLICA = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
export const MODO_PRUEBA = !(URL_SUPABASE && CLAVE_PUBLICA)

// codigo: 'apodo_usado' | 'credenciales' | 'limite' | 'sin_conexion' | 'confirmacion_activa' | 'otro'
export class ErrorCuenta extends Error {
  constructor(codigo, detalle) {
    super(detalle || codigo)
    this.codigo = codigo
  }
}

export function nuevoId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

function traducir(error) {
  if (error instanceof ErrorCuenta) return error
  const codigo = error?.code || ''
  const msj = error?.message || ''
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return new ErrorCuenta('sin_conexion')
  if (codigo === 'user_already_exists' || /already registered/i.test(msj)) return new ErrorCuenta('apodo_usado')
  if (codigo === 'invalid_credentials' || /invalid login credentials/i.test(msj)) return new ErrorCuenta('credenciales')
  if (error?.status === 429 || /rate limit/i.test(codigo + msj)) return new ErrorCuenta('limite')
  if (error?.name === 'AuthRetryableFetchError' || /failed to fetch|network|load failed/i.test(msj)) return new ErrorCuenta('sin_conexion')
  return new ErrorCuenta('otro', msj)
}

const usuarioDe = (user) => ({
  userId: user.id,
  nickname: user.user_metadata?.nickname ?? '',
  emprendimiento: user.user_metadata?.emprendimiento ?? '',
})

const CAMPOS_MOVIMIENTO = 'id, fecha, tipo, concepto, unidades, monto, created_at'

function crearSupabase() {
  const sb = createClient(URL_SUPABASE, CLAVE_PUBLICA, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'escala:sesion' },
  })
  const ok = ({ data, error }) => {
    if (error) throw traducir(error)
    return data
  }

  return {
    async sesion() {
      const { data } = await sb.auth.getSession()
      return data.session?.user ? usuarioDe(data.session.user) : null
    },

    async crearCuenta({ apodo, documento, emprendimiento }) {
      const email = correoDeApodo(apodo)
      const password = claveDeDocumento(documento)
      const datos = { nickname: limpiarTexto(apodo), emprendimiento: limpiarTexto(emprendimiento) }
      const r = await sb.auth.signUp({ email, password, options: { data: datos } }).catch((e) => ({ error: e }))
      if (r.error) {
        const e = traducir(r.error)
        if (e.codigo === 'apodo_usado') {
          // Puede ser la misma persona que ya tenía cuenta y tocó "crear": si el DNI coincide, entra.
          const otra = await sb.auth.signInWithPassword({ email, password }).catch(() => ({ error: true }))
          if (!otra.error) return { ...usuarioDe(otra.data.user), yaExistia: true }
        }
        throw e
      }
      // Con "Confirm email" activado Supabase no abre sesión: hay que desactivarlo en el panel.
      if (!r.data.session) throw new ErrorCuenta('confirmacion_activa')
      return usuarioDe(r.data.user)
    },

    async ingresar({ apodo, documento }) {
      const r = await sb.auth
        .signInWithPassword({ email: correoDeApodo(apodo), password: claveDeDocumento(documento) })
        .catch((e) => ({ error: e }))
      if (r.error) throw traducir(r.error)
      return usuarioDe(r.data.user)
    },

    async salir() {
      await sb.auth.signOut({ scope: 'local' })
    },

    async cargarNegocio(userId) {
      const data = ok(
        await sb.from('negocios').select('nickname, emprendimiento, rubro, datos, updated_at').eq('user_id', userId).maybeSingle(),
      )
      return data && { nickname: data.nickname, emprendimiento: data.emprendimiento, rubro: data.rubro, datos: data.datos }
    },

    async guardarNegocio(userId, perfil) {
      ok(
        await sb.from('negocios').upsert(
          {
            user_id: userId,
            nickname: perfil.nickname,
            emprendimiento: perfil.emprendimiento,
            rubro: perfil.rubro,
            datos: perfil.datos,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        ),
      )
    },

    async listarMovimientos() {
      return ok(await sb.from('movimientos').select(CAMPOS_MOVIMIENTO).order('fecha', { ascending: false }).limit(5000))
    },

    async agregarMovimiento(userId, m) {
      const { error } = await sb.from('movimientos').insert({
        id: m.id, fecha: m.fecha, tipo: m.tipo, concepto: m.concepto, unidades: m.unidades ?? null, monto: m.monto,
      })
      // 23505 = ya estaba guardado (reintento después de perder la conexión).
      if (error && error.code !== '23505') throw traducir(error)
    },

    async borrarMovimiento(userId, id) {
      ok(await sb.from('movimientos').delete().eq('id', id))
    },
  }
}

// ---------- Modo prueba: todo en localStorage ----------
function crearLocal() {
  const leer = (k, def) => {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? def
    } catch {
      return def
    }
  }
  const escribir = (k, v) => localStorage.setItem(k, JSON.stringify(v))
  const resumen = async (texto) => {
    if (!globalThis.crypto?.subtle) return texto
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto))
    return [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('')
  }
  const K = { cuentas: 'escala:prueba:cuentas', sesion: 'escala:prueba:sesion' }
  const pausa = () => new Promise((r) => setTimeout(r, 250))

  return {
    async sesion() {
      return leer(K.sesion, null)
    },
    async crearCuenta({ apodo, documento, emprendimiento }) {
      await pausa()
      const cuentas = leer(K.cuentas, {})
      const clave = claveApodo(apodo)
      const hash = await resumen(claveDeDocumento(documento))
      if (cuentas[clave]) {
        if (cuentas[clave].hash !== hash) throw new ErrorCuenta('apodo_usado')
        escribir(K.sesion, cuentas[clave].usuario)
        return { ...cuentas[clave].usuario, yaExistia: true }
      }
      const usuario = { userId: nuevoId(), nickname: limpiarTexto(apodo), emprendimiento: limpiarTexto(emprendimiento) }
      cuentas[clave] = { hash, usuario }
      escribir(K.cuentas, cuentas)
      escribir(K.sesion, usuario)
      return usuario
    },
    async ingresar({ apodo, documento }) {
      await pausa()
      const cuenta = leer(K.cuentas, {})[claveApodo(apodo)]
      if (!cuenta || cuenta.hash !== (await resumen(claveDeDocumento(documento)))) throw new ErrorCuenta('credenciales')
      escribir(K.sesion, cuenta.usuario)
      return cuenta.usuario
    },
    async salir() {
      localStorage.removeItem(K.sesion)
    },
    async cargarNegocio(userId) {
      return leer(`escala:prueba:negocio:${userId}`, null)
    },
    async guardarNegocio(userId, perfil) {
      escribir(`escala:prueba:negocio:${userId}`, perfil)
    },
    async listarMovimientos(userId) {
      return leer(`escala:prueba:caja:${userId}`, [])
    },
    async agregarMovimiento(userId, m) {
      const lista = leer(`escala:prueba:caja:${userId}`, [])
      if (!lista.some((x) => x.id === m.id)) escribir(`escala:prueba:caja:${userId}`, [...lista, m])
    },
    async borrarMovimiento(userId, id) {
      escribir(`escala:prueba:caja:${userId}`, leer(`escala:prueba:caja:${userId}`, []).filter((x) => x.id !== id))
    },
  }
}

export const almacen = MODO_PRUEBA ? crearLocal() : crearSupabase()

export const MENSAJES_ERROR = {
  apodo_usado: 'Ese nombre ya tiene cuenta. Si es tuya, entra con tu DNI. Si no, agrega tu apellido o un número.',
  credenciales: 'El nombre o el DNI no coinciden. Revisa cómo lo escribiste al crear tu cuenta.',
  limite: 'Muchas personas están entrando a la vez. Espera un minuto y vuelve a intentar.',
  sin_conexion: 'No hay internet. Revisa tu conexión y vuelve a intentar.',
  confirmacion_activa: 'La app no está bien configurada (confirmación de correo activa). Avisa al facilitador.',
  otro: 'Algo salió mal. Vuelve a intentar en un momento.',
}
