// Avance de la capacitación: las lecciones se abren en orden, como en una clase.
import { LECCIONES, MODULOS } from '../data/educacion.js'

// estado: 'hecha' | 'abierta' (la que toca) | 'bloqueada'
export function estadoLecciones(hechas = {}) {
  let siguiente = null
  const lista = LECCIONES.map((l, i) => {
    const hecha = !!hechas[l.id]
    const anterior = i === 0 ? null : LECCIONES[i - 1]
    const abierta = hecha || i === 0 || !!hechas[anterior.id]
    if (!hecha && abierta && !siguiente) siguiente = l.id
    return { ...l, numero: i + 1, estado: hecha ? 'hecha' : abierta ? 'abierta' : 'bloqueada', anterior }
  })
  const completadas = lista.filter((l) => l.estado === 'hecha').length
  return {
    lista,
    siguiente,
    completadas,
    total: LECCIONES.length,
    terminado: completadas === LECCIONES.length,
    modulos: MODULOS.map((m) => {
      const suyas = lista.filter((l) => l.modulo === m.id)
      return { ...m, lecciones: suyas, hechas: suyas.filter((l) => l.estado === 'hecha').length }
    }),
  }
}

export const puedeAbrir = (hechas, id) => estadoLecciones(hechas).lista.find((l) => l.id === id)?.estado !== 'bloqueada'
