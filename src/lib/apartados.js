// Los apartados del lobby, su orden, de qué dependen y cuándo están completos.
// grupo 'plan': se hacen una vez, en orden sugerido. 'dia': herramientas de uso diario. 'aprende': educación.

// color: tono que distingue cada apartado en el lobby (franja e ícono). Se leen con texto blanco encima.
export const GRUPOS = [
  { id: 'plan', nombre: 'Tu plan', color: 'var(--marca)' },
  { id: 'dia', nombre: 'Tu negocio día a día', color: '#1f8a5b' },
  { id: 'aprende', nombre: 'Aprende', color: '#c2366f' },
  { id: 'marca', nombre: 'Tu marca', color: '#c2366f' },
]

// Barra de abajo. En Inicio van el plan y las lecciones; las demás pestañas son apartados aparte.
// Para agregar una pestaña nueva (por ejemplo la revista o prácticas ecológicas):
// 1) agrega aquí { id, ruta, nombre, icono }, 2) crea su pantalla y su ruta en App.jsx,
// 3) si además es un apartado del lobby, agrégalo a APARTADOS con su grupo.
export const PESTANAS = [
  { id: 'inicio', ruta: '/', nombre: 'Inicio', icono: '🏠' },
  { id: 'negocio', ruta: '/negocio', nombre: 'Negocio', icono: '📒', grupo: 'dia', titulo: 'Tu negocio día a día' },
  { id: 'marca', ruta: '/marca', nombre: 'Marca', icono: '✨' },
  { id: 'escalemos', ruta: '/escalemos', nombre: 'Revista', icono: '📰' },
]

// Qué pestaña se pinta activa según dónde está la persona.
export function pestanaDe(seccion) {
  if (!seccion) return 'inicio'
  if (seccion === 'marca') return 'marca'
  if (seccion === 'escalemos') return 'escalemos'
  if (seccion === 'educacion') return 'inicio'
  if (seccion === 'negocio') return 'negocio'
  const g = APARTADO[seccion]?.grupo
  // El plan y las lecciones se ven desde Inicio.
  return g === 'dia' ? 'negocio' : g === 'marca' ? 'marca' : g === 'plan' || g === 'aprende' ? 'inicio' : null
}

export const APARTADOS = [
  { id: 'presupuesto', grupo: 'plan', numero: 1, nombre: 'Presupuesto de arranque', emoji: '💰', color: '#b7730c', claro: '#fff1d6', requiere: [] },
  { id: 'costos', grupo: 'plan', numero: 2, nombre: 'Costos del mes', emoji: '🧾', color: '#d4551f', claro: '#ffe6da', requiere: [] },
  { id: 'precio', grupo: 'plan', numero: 3, nombre: 'Precio de venta', emoji: '🏷️', color: '#c2366f', claro: '#fde2ed', requiere: ['costos'] },
  { id: 'meta', grupo: 'plan', numero: 4, nombre: 'Meta de ventas', emoji: '🎯', color: '#2f6fdb', claro: '#e0ebfd', requiere: ['precio'] },
  { id: 'flujo', grupo: 'plan', numero: 5, nombre: 'Flujo de caja', emoji: '📅', color: '#0e8a8a', claro: '#daf3f2', requiere: ['presupuesto', 'precio'] },
  { id: 'caja', grupo: 'dia', nombre: 'Control de caja', emoji: '📒', color: '#1f8a5b', claro: '#dff3e8', requiere: [] },
  { id: 'inventario', grupo: 'dia', nombre: 'Inventario', emoji: '📦', color: '#9a6417', claro: '#f7ecd9', requiere: [] },
  { id: 'costeo', grupo: 'dia', nombre: 'Costo por producto', emoji: '🧮', color: '#5b4bd6', claro: '#e8e5fc', requiere: [] },
  { id: 'marca', grupo: 'marca', nombre: 'Mi marca', emoji: '✨', color: '#c2366f', claro: '#fde2ed', requiere: [] },
  { id: 'educacion', grupo: 'aprende', nombre: 'Educación financiera', emoji: '🎓', color: '#9b34c9', claro: '#f3e4fb', requiere: [] },
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
