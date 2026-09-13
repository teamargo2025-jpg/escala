import { useEffect, useReducer } from 'react'
import { RUBROS } from './data/rubros.js'
import { CLAVE_GUARDADO, GANANCIA_INICIAL, MESES_FLUJO } from './config.js'
import { num } from './lib/calc.js'

// Orden del recorrido. `paso` es el número que ve la persona (1 a 7).
export const PANTALLAS = [
  { id: 'inicio', paso: 0 },
  { id: 'rubro', paso: 1, titulo: 'Tu oficio' },
  { id: 'arranque', paso: 2, titulo: 'Para arrancar' },
  { id: 'fijos', paso: 3, titulo: 'Tus costos del mes' },
  { id: 'variables', paso: 3, titulo: 'Tus costos del mes' },
  { id: 'cantidad', paso: 3, titulo: 'Tus costos del mes' },
  { id: 'precio', paso: 4, titulo: 'Tu precio' },
  { id: 'meta', paso: 5, titulo: 'Tu meta' },
  { id: 'flujo', paso: 6, titulo: 'Tu flujo de caja' },
  { id: 'resumen', paso: 7, titulo: 'Resumen' },
]
export const TOTAL_PASOS = 7

const INICIAL = {
  version: 1,
  pantalla: 'inicio',
  rubro: null,
  arranque: [],
  fijos: [],
  variables: [],
  cantidad: '',
  ganancia: GANANCIA_INICIAL,
  metaGanancia: '',
  flujo: null,
}

let siguienteId = Date.now()
const nuevoId = () => `i${(siguienteId++).toString(36)}`

const desdeSugerencias = (lista) =>
  lista.map((s) => ({ id: nuevoId(), nombre: s.nombre, sugerido: s.precio, ayuda: s.ayuda, precio: '', marcado: false }))

function reducir(estado, accion) {
  switch (accion.tipo) {
    case 'ir':
      return { ...estado, pantalla: accion.pantalla }
    case 'elegirRubro': {
      if (estado.rubro === accion.rubro) return { ...estado, pantalla: 'arranque' }
      const r = RUBROS[accion.rubro]
      return {
        ...INICIAL,
        pantalla: 'arranque',
        rubro: r.id,
        arranque: desdeSugerencias(r.arranque),
        fijos: desdeSugerencias(r.fijos),
        variables: desdeSugerencias(r.variables),
      }
    }
    case 'item': {
      const lista = estado[accion.lista].map((it) => {
        if (it.id !== accion.id) return it
        const cambio = { ...it, ...accion.cambio }
        // Al marcar por primera vez, se llena con el precio de ejemplo para no dejar la casilla vacía.
        if (accion.cambio.marcado && it.precio === '' && it.sugerido != null) cambio.precio = String(it.sugerido)
        // Escribir un precio marca la fila.
        if ('precio' in accion.cambio && num(accion.cambio.precio) > 0) cambio.marcado = true
        return cambio
      })
      return { ...estado, [accion.lista]: lista }
    }
    case 'agregarItem':
      return {
        ...estado,
        [accion.lista]: [...estado[accion.lista], { id: nuevoId(), nombre: '', precio: '', marcado: true, propio: true }],
      }
    case 'quitarItem':
      return { ...estado, [accion.lista]: estado[accion.lista].filter((it) => it.id !== accion.id) }
    case 'campo':
      return { ...estado, [accion.campo]: accion.valor }
    case 'prepararFlujo': {
      if (estado.flujo && estado.flujo.length === MESES_FLUJO) return estado
      // Idea inicial: se empieza vendiendo poco y se crece hacia lo que puedes hacer.
      const c = Math.floor(num(estado.cantidad))
      const flujo = Array.from({ length: MESES_FLUJO }, (_, i) =>
        String(Math.round(c * Math.min(1, 0.5 + (0.5 * i) / Math.max(1, MESES_FLUJO - 1)))),
      )
      return { ...estado, flujo }
    }
    case 'flujoMes': {
      const flujo = [...estado.flujo]
      flujo[accion.mes] = accion.valor
      return { ...estado, flujo }
    }
    case 'reiniciar':
      return { ...INICIAL, pantalla: 'rubro' }
    default:
      return estado
  }
}

function cargar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_GUARDADO))
    if (guardado && guardado.version === INICIAL.version && RUBROS[guardado.rubro]) return { ...INICIAL, ...guardado }
  } catch {
    // Almacenamiento bloqueado o dañado: se empieza de cero.
  }
  return INICIAL
}

export function useEstado() {
  const [estado, despachar] = useReducer(reducir, undefined, cargar)
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(estado))
    } catch {
      // Sin almacenamiento: la app sigue funcionando, solo no recuerda.
    }
  }, [estado])
  return [estado, despachar]
}
