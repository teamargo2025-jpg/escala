// Los apartados del lobby, su orden, de qué dependen y cuándo están completos.
// grupo 'plan': se hacen una vez, en orden sugerido. 'dia': herramientas de uso diario. 'aprende': educación.

export const GRUPOS = [
  { id: 'plan', nombre: 'Tu plan' },
  { id: 'dia', nombre: 'Tu negocio día a día' },
  { id: 'aprende', nombre: 'Aprende' },
]

export const APARTADOS = [
  { id: 'presupuesto', grupo: 'plan', numero: 1, nombre: 'Presupuesto de arranque', emoji: '💰', requiere: [] },
  { id: 'costos', grupo: 'plan', numero: 2, nombre: 'Costos del mes', emoji: '🧾', requiere: [] },
  { id: 'precio', grupo: 'plan', numero: 3, nombre: 'Precio de venta', emoji: '🏷️', requiere: ['costos'] },
  { id: 'meta', grupo: 'plan', numero: 4, nombre: 'Meta de ventas', emoji: '🎯', requiere: ['precio'] },
  { id: 'flujo', grupo: 'plan', numero: 5, nombre: 'Flujo de caja', emoji: '📅', requiere: ['presupuesto', 'precio'] },
  { id: 'caja', grupo: 'dia', nombre: 'Control de caja', emoji: '📒', requiere: [] },
  { id: 'inventario', grupo: 'dia', nombre: 'Inventario', emoji: '📦', requiere: [] },
  { id: 'costeo', grupo: 'dia', nombre: 'Costo por producto', emoji: '🧮', requiere: [] },
  { id: 'educacion', grupo: 'aprende', nombre: 'Educación financiera', emoji: '🎓', requiere: [] },
]

export const APARTADO = Object.fromEntries(APARTADOS.map((a) => [a.id, a]))

// Si un apartado está bloqueado, el primero de sus requisitos que sí se puede hacer.
export function destinoDisponible(lista, id) {
  const a = lista.find((x) => x.id === id)
  return a.estado === 'bloqueado' ? destinoDisponible(lista, a.faltan[0].id) : id
}

// estado: 'hecho' | 'disponible' | 'bloqueado'. `siguiente` es el apartado del plan que se sugiere hacer ahora.
export function estadoApartados(hechos = {}) {
  const lista = APARTADOS.map((a) => {
    const faltan = a.requiere.filter((r) => !hechos[r])
    const estado = hechos[a.id] ? 'hecho' : faltan.length ? 'bloqueado' : 'disponible'
    return { ...a, estado, faltan: faltan.map((f) => APARTADO[f]) }
  })
  const plan = lista.filter((a) => a.grupo === 'plan')
  const siguiente = plan.find((a) => a.estado === 'disponible')?.id ?? null
  return { lista, siguiente, planCompleto: plan.every((a) => a.estado === 'hecho') }
}
