// Los apartados del lobby, su orden, de qué dependen y cuándo están completos.

export const APARTADOS = [
  { id: 'presupuesto', numero: 1, nombre: 'Presupuesto de arranque', emoji: '💰', requiere: [] },
  { id: 'costos', numero: 2, nombre: 'Costos del mes', emoji: '🧾', requiere: [] },
  { id: 'precio', numero: 3, nombre: 'Precio de venta', emoji: '🏷️', requiere: ['costos'] },
  { id: 'meta', numero: 4, nombre: 'Meta de ventas', emoji: '🎯', requiere: ['precio'] },
  { id: 'flujo', numero: 5, nombre: 'Flujo de caja', emoji: '📅', requiere: ['presupuesto', 'precio'] },
  { id: 'caja', numero: 6, nombre: 'Control de caja', emoji: '📒', requiere: [] },
]

export const APARTADO = Object.fromEntries(APARTADOS.map((a) => [a.id, a]))

// Si un apartado está bloqueado, el primero de sus requisitos que sí se puede hacer.
export function destinoDisponible(lista, id) {
  const a = lista.find((x) => x.id === id)
  return a.estado === 'bloqueado' ? destinoDisponible(lista, a.faltan[0].id) : id
}

// estado: 'hecho' | 'disponible' | 'bloqueado'. `siguiente` es el que se sugiere hacer ahora.
// El control de caja no entra en la sugerencia: se usa cuando la persona ya vende.
export function estadoApartados(hechos = {}) {
  const lista = APARTADOS.map((a) => {
    const faltan = a.requiere.filter((r) => !hechos[r])
    const estado = hechos[a.id] ? 'hecho' : faltan.length ? 'bloqueado' : 'disponible'
    return { ...a, estado, faltan: faltan.map((f) => APARTADO[f]) }
  })
  const siguiente = lista.find((a) => a.id !== 'caja' && a.estado === 'disponible')?.id ?? null
  return { lista, siguiente, planCompleto: lista.every((a) => a.id === 'caja' || a.estado === 'hecho') }
}
