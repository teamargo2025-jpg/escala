// Los datos del negocio de la persona que entró: se guardan al instante en el celular
// y se sincronizan con el almacén (Supabase) en segundo plano, con reintentos si no hay internet.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RUBROS } from './data/rubros.js'
import { CLAVE_GUARDADO, GANANCIA_INICIAL, MESES_FLUJO } from './config.js'
import { almacen, nuevoId } from './almacen.js'
import { calcular, num } from './lib/calc.js'
import { hoy } from './lib/caja.js'
import { aplicarMovimiento, inventarioVacio, usarProducto } from './lib/inventario.js'
import { LECCIONES } from './data/educacion.js'

const desdeSugerencias = (lista) =>
  lista.map((s) => ({ id: nuevoId(), nombre: s.nombre, sugerido: s.precio, ayuda: s.ayuda, precio: '', marcado: false }))

export function datosIniciales(rubroId, rubroPropio) {
  const r = RUBROS[rubroId] ?? rubroPropio
  return {
    ...(rubroPropio ? { rubroPersonalizado: rubroPropio } : {}),
    arranque: desdeSugerencias(r.arranque),
    fijos: desdeSugerencias(r.fijos),
    variables: desdeSugerencias(r.variables),
    cantidad: '',
    ganancia: GANANCIA_INICIAL,
    metaGanancia: '',
    flujo: null,
    hechos: {},
  }
}

// Cuentas hechas con la primera versión (sin cuentas) en este celular.
export function datosVersionAnterior() {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE_GUARDADO))
    if (!v || !RUBROS[v.rubro]) return null
    const n = calcular(v)
    const hechos = {
      presupuesto: n.inversion > 0,
      costos: n.variableUnidad > 0 && n.cantidad > 0,
    }
    hechos.precio = hechos.costos && ['meta', 'flujo', 'resumen'].includes(v.pantalla)
    hechos.meta = hechos.precio && ['flujo', 'resumen'].includes(v.pantalla)
    hechos.flujo = hechos.precio && v.pantalla === 'resumen' && Array.isArray(v.flujo)
    const { arranque, fijos, variables, cantidad, ganancia, metaGanancia, flujo } = v
    return { rubro: v.rubro, datos: { arranque, fijos, variables, cantidad, ganancia, metaGanancia, flujo, hechos } }
  } catch {
    return null
  }
}

export function olvidarVersionAnterior() {
  try {
    localStorage.removeItem(CLAVE_GUARDADO)
  } catch {
    // nada
  }
}

export function reducirDatos(d, accion) {
  switch (accion.tipo) {
    case 'item': {
      const lista = d[accion.lista].map((it) => {
        if (it.id !== accion.id) return it
        const cambio = { ...it, ...accion.cambio }
        // Al marcar por primera vez se llena con el precio de ejemplo: nunca una casilla vacía.
        if (accion.cambio.marcado && it.precio === '' && it.sugerido != null) cambio.precio = String(it.sugerido)
        if ('precio' in accion.cambio && num(accion.cambio.precio) > 0) cambio.marcado = true
        // Si le cambian el nombre, la ayuda del ejemplo ya no corresponde.
        if ('nombre' in accion.cambio) delete cambio.ayuda
        return cambio
      })
      return { ...d, [accion.lista]: lista }
    }
    case 'agregarItem':
      return { ...d, [accion.lista]: [...d[accion.lista], { id: nuevoId(), nombre: '', precio: '', marcado: true, propio: true }] }
    case 'quitarItem':
      return { ...d, [accion.lista]: d[accion.lista].filter((it) => it.id !== accion.id) }
    case 'campo':
      return { ...d, [accion.campo]: accion.valor }
    case 'prepararFlujo': {
      if (d.flujo && d.flujo.length === MESES_FLUJO) return d
      // Idea inicial: se empieza vendiendo poco y se crece hacia lo que puedes hacer.
      const c = Math.floor(num(d.cantidad))
      const flujo = Array.from({ length: MESES_FLUJO }, (_, i) =>
        String(Math.round(c * Math.min(1, 0.5 + (0.5 * i) / Math.max(1, MESES_FLUJO - 1)))),
      )
      return { ...d, flujo }
    }
    case 'flujoMes': {
      const flujo = [...d.flujo]
      flujo[accion.mes] = accion.valor
      return { ...d, flujo }
    }
    case 'hecho':
      return { ...d, hechos: { ...d.hechos, [accion.apartado]: true } }

    // ---------- Educación financiera ----------
    case 'leccion': {
      const educacion = { ...d.educacion, [accion.id]: true }
      const todas = LECCIONES.every((l) => educacion[l.id])
      return { ...d, educacion, hechos: todas ? { ...d.hechos, educacion: true } : d.hechos }
    }

    // ---------- Inventario ----------
    case 'material:agregar': {
      const inv = inventarioDe(d)
      const m = accion.material
      const material = { id: m.id ?? nuevoId(), nombre: m.nombre, medida: m.medida, costo: num(m.costo), stock: 0, minimo: num(m.minimo) }
      let nuevo = { ...inv, materiales: [...inv.materiales, material] }
      if (num(m.stock) > 0) {
        nuevo = aplicarMovimiento(nuevo, { id: nuevoId(), fecha: hoy(), materialId: material.id, tipo: 'ajuste', cantidad: num(m.stock), nota: 'Cantidad inicial' })
      }
      return { ...d, inventario: nuevo }
    }
    case 'material:editar': {
      const inv = inventarioDe(d)
      const materiales = inv.materiales.map((m) => (m.id === accion.id ? { ...m, ...accion.cambio } : m))
      return { ...d, inventario: { ...inv, materiales } }
    }
    case 'material:quitar': {
      const inv = inventarioDe(d)
      return {
        ...d,
        inventario: { ...inv, materiales: inv.materiales.filter((m) => m.id !== accion.id) },
        productos: (d.productos ?? []).map((p) => ({ ...p, materiales: p.materiales.filter((l) => l.materialId !== accion.id) })),
      }
    }
    case 'material:ejemplos': {
      const inv = inventarioDe(d)
      const nombres = new Set(inv.materiales.map((m) => m.nombre.toLowerCase()))
      const nuevos = accion.materiales
        .filter((m) => !nombres.has(m.nombre.toLowerCase()))
        .map((m) => ({ id: nuevoId(), nombre: m.nombre, medida: m.medida, costo: m.costo, stock: 0, minimo: m.minimo ?? 0 }))
      return { ...d, inventario: { ...inv, materiales: [...inv.materiales, ...nuevos] } }
    }
    case 'inventario:movimiento':
      return { ...d, inventario: aplicarMovimiento(inventarioDe(d), { id: nuevoId(), fecha: hoy(), ...accion.movimiento }) }
    case 'inventario:usarProducto': {
      const producto = (d.productos ?? []).find((p) => p.id === accion.productoId)
      if (!producto) return d
      return { ...d, inventario: usarProducto(inventarioDe(d), producto, accion.cantidad, { fecha: accion.fecha ?? hoy(), nuevoId }) }
    }

    // ---------- Marca y contenido ----------
    case 'marca:campo':
      return { ...d, marca: { ...(d.marca ?? {}), [accion.campo]: accion.valor } }
    case 'contenido:agregar': {
      const marca = d.marca ?? {}
      const contenido = { id: nuevoId(), estado: 'pendiente', ...accion.contenido }
      return { ...d, marca: { ...marca, contenidos: [...(marca.contenidos ?? []), contenido] } }
    }
    case 'contenido:estado': {
      const marca = d.marca ?? {}
      return {
        ...d,
        marca: { ...marca, contenidos: (marca.contenidos ?? []).map((c) => (c.id === accion.id ? { ...c, estado: accion.estado } : c)) },
      }
    }
    case 'contenido:quitar': {
      const marca = d.marca ?? {}
      return { ...d, marca: { ...marca, contenidos: (marca.contenidos ?? []).filter((c) => c.id !== accion.id) } }
    }

    // ---------- Costo por producto ----------
    case 'producto:guardar': {
      const productos = d.productos ?? []
      const existe = productos.some((p) => p.id === accion.producto.id)
      return {
        ...d,
        productos: existe ? productos.map((p) => (p.id === accion.producto.id ? accion.producto : p)) : [...productos, accion.producto],
      }
    }
    case 'producto:quitar':
      return { ...d, productos: (d.productos ?? []).filter((p) => p.id !== accion.id) }
    case 'producto:ejemplo': {
      // Crea la ficha de ejemplo y, si faltan, sus materiales en el inventario (con cantidad 0).
      const ej = accion.ejemplo
      let inv = inventarioDe(d)
      const idPorClave = {}
      for (const [clave] of Object.entries(ej.usa)) {
        const base = accion.materiales.find((m) => m.clave === clave)
        if (!base) continue
        let m = inv.materiales.find((x) => x.nombre.toLowerCase() === base.nombre.toLowerCase())
        if (!m) {
          m = { id: nuevoId(), nombre: base.nombre, medida: base.medida, costo: base.costo, stock: 0, minimo: base.minimo ?? 0 }
          inv = { ...inv, materiales: [...inv.materiales, m] }
        }
        idPorClave[clave] = m.id
      }
      const producto = {
        id: accion.id ?? nuevoId(),
        nombre: ej.nombre,
        horas: String(ej.horas),
        incluirFijos: true,
        precioVenta: '',
        materiales: Object.entries(ej.usa)
          .filter(([clave]) => idPorClave[clave])
          .map(([clave, cantidad]) => ({ materialId: idPorClave[clave], cantidad: String(cantidad) })),
      }
      return { ...d, inventario: inv, productos: [...(d.productos ?? []), producto] }
    }
    default:
      return d
  }
}

export const inventarioDe = (d) => d.inventario ?? inventarioVacio()

// ---------- Guardado local + sincronización ----------
const claveCache = (userId) => `escala:u:${userId}`
const SIN_PENDIENTES = { negocio: 0, altas: [], bajas: [] }

function leerCache(userId) {
  try {
    const c = JSON.parse(localStorage.getItem(claveCache(userId)))
    if (c) return { perfil: c.perfil ?? null, movimientos: c.movimientos ?? [], pend: { ...SIN_PENDIENTES, ...c.pend } }
  } catch {
    // cache dañada: se vuelve a bajar del servidor
  }
  return { perfil: null, movimientos: [], pend: SIN_PENDIENTES }
}

const hayPendientes = (p) => p.negocio > 0 || p.altas.length > 0 || p.bajas.length > 0

export function useNegocio(usuario) {
  const userId = usuario.userId
  const [c, setC] = useState(() => leerCache(userId))
  const [cargado, setCargado] = useState(false)
  const [errorCarga, setErrorCarga] = useState(null)
  const [fallo, setFallo] = useState(false)
  const ref = useRef(c)
  ref.current = c

  useEffect(() => {
    try {
      localStorage.setItem(claveCache(userId), JSON.stringify(c))
    } catch {
      // sin almacenamiento: queda en memoria
    }
  }, [c, userId])

  // Carga desde el servidor y mezcla con lo que haya quedado sin subir.
  useEffect(() => {
    let vivo = true
    ;(async () => {
      try {
        const [perfil, movs] = await Promise.all([almacen.cargarNegocio(userId), almacen.listarMovimientos(userId)])
        if (!vivo) return
        setC((act) => {
          const { pend } = act
          const bajas = new Set(pend.bajas)
          const delServidor = movs.filter((m) => !bajas.has(m.id))
          const ids = new Set(delServidor.map((m) => m.id))
          const soloLocales = act.movimientos.filter((m) => pend.altas.includes(m.id) && !ids.has(m.id))
          return {
            perfil: pend.negocio > 0 ? act.perfil : perfil,
            movimientos: [...delServidor, ...soloLocales],
            pend,
          }
        })
        setErrorCarga(null)
      } catch (e) {
        if (vivo) setErrorCarga(e)
      } finally {
        if (vivo) setCargado(true)
      }
    })()
    return () => {
      vivo = false
    }
  }, [userId])

  const sincronizar = useCallback(async () => {
    const { perfil, movimientos, pend } = ref.current
    if (!hayPendientes(pend)) return
    try {
      if (pend.negocio > 0 && perfil) {
        const version = pend.negocio
        await almacen.guardarNegocio(userId, perfil)
        setC((a) => ({ ...a, pend: { ...a.pend, negocio: a.pend.negocio === version ? 0 : a.pend.negocio } }))
      }
      for (const id of pend.altas) {
        const m = movimientos.find((x) => x.id === id)
        if (m) await almacen.agregarMovimiento(userId, m)
        setC((a) => ({ ...a, pend: { ...a.pend, altas: a.pend.altas.filter((x) => x !== id) } }))
      }
      for (const id of pend.bajas) {
        await almacen.borrarMovimiento(userId, id)
        setC((a) => ({ ...a, pend: { ...a.pend, bajas: a.pend.bajas.filter((x) => x !== id) } }))
      }
      setFallo(false)
    } catch {
      // Se reintenta con el próximo cambio, al volver internet o cada 30 s.
      setFallo(true)
    }
  }, [userId])

  const pendientes = hayPendientes(c.pend)
  useEffect(() => {
    if (!pendientes || !cargado) return
    const t = setTimeout(sincronizar, 1200)
    const intervalo = setInterval(sincronizar, 30000)
    window.addEventListener('online', sincronizar)
    return () => {
      clearTimeout(t)
      clearInterval(intervalo)
      window.removeEventListener('online', sincronizar)
    }
  }, [c, pendientes, cargado, sincronizar])

  const cambiarPerfil = useCallback((fn) => {
    setC((a) => ({ ...a, perfil: fn(a.perfil), pend: { ...a.pend, negocio: a.pend.negocio + 1 } }))
  }, [])

  const despachar = useCallback(
    (accion) => cambiarPerfil((p) => ({ ...p, datos: reducirDatos(p.datos, accion) })),
    [cambiarPerfil],
  )

  const crearNegocio = useCallback(
    (rubro, datos, rubroPropio) =>
      cambiarPerfil((p) => ({
        nickname: p?.nickname ?? usuario.nickname,
        emprendimiento: p?.emprendimiento ?? usuario.emprendimiento,
        rubro,
        datos: datos ?? datosIniciales(rubro, rubroPropio),
      })),
    [cambiarPerfil, usuario.nickname, usuario.emprendimiento],
  )

  const agregarMovimiento = useCallback((m) => {
    const mov = { ...m, id: nuevoId(), created_at: new Date().toISOString() }
    setC((a) => ({ ...a, movimientos: [...a.movimientos, mov], pend: { ...a.pend, altas: [...a.pend.altas, mov.id] } }))
  }, [])

  const borrarMovimiento = useCallback((id) => {
    setC((a) => {
      const soloLocal = a.pend.altas.includes(id)
      return {
        ...a,
        movimientos: a.movimientos.filter((m) => m.id !== id),
        pend: {
          ...a.pend,
          altas: a.pend.altas.filter((x) => x !== id),
          bajas: soloLocal ? a.pend.bajas : [...a.pend.bajas, id],
        },
      }
    })
  }, [])

  const n = useMemo(() => (c.perfil?.datos ? calcular(c.perfil.datos) : null), [c.perfil])

  return {
    cargado: cargado || !!c.perfil,
    errorCarga: c.perfil ? null : errorCarga,
    perfil: c.perfil,
    movimientos: c.movimientos,
    n,
    despachar,
    cambiarPerfil,
    crearNegocio,
    agregarMovimiento,
    borrarMovimiento,
    guardado: pendientes ? (fallo || navigator.onLine === false ? 'pendiente' : 'guardando') : 'ok',
  }
}

// ---------- Navegación con el botón "atrás" del celular ----------
const avisar = () => window.dispatchEvent(new Event('escala:ruta'))
const profundidad = () => history.state?.escala ?? 0

export function ir(ruta) {
  history.pushState({ escala: profundidad() + 1 }, '', `#${ruta}`)
  avisar()
}

export function reemplazar(ruta) {
  history.replaceState({ escala: profundidad() }, '', `#${ruta}`)
  avisar()
}

export function volver(destino) {
  if (profundidad() > 0) history.back()
  else reemplazar(destino)
}

// Vuelve al lobby dejando el historial limpio (el "atrás" no regresa a pantallas ya cerradas).
export function irAlInicio() {
  const d = profundidad()
  if (d === 0) return reemplazar('/')
  const alVolver = () => {
    window.removeEventListener('popstate', alVolver)
    reemplazar('/')
  }
  window.addEventListener('popstate', alVolver)
  history.go(-d)
}

export function useRuta() {
  const leer = () => (location.hash.slice(1) || '/').split('/').filter(Boolean)
  const [ruta, setRuta] = useState(leer)
  useEffect(() => {
    const f = () => setRuta(leer())
    window.addEventListener('popstate', f)
    window.addEventListener('hashchange', f)
    window.addEventListener('escala:ruta', f)
    return () => {
      window.removeEventListener('popstate', f)
      window.removeEventListener('hashchange', f)
      window.removeEventListener('escala:ruta', f)
    }
  }, [])
  return ruta
}
