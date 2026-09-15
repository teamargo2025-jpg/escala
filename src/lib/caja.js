// Cálculos del control de caja. Las fechas son 'AAAA-MM-DD' en hora local.

export function hoy(fecha = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}`
}

export const mesDe = (fecha) => fecha.slice(0, 7)

// El dinero con el que se empieza cuenta para el saldo, pero no es un ingreso del mes.
export const CONCEPTO_INICIAL = 'Dinero con el que empiezo'

export function saldo(movimientos) {
  return movimientos.reduce((s, m) => s + (m.tipo === 'entrada' ? 1 : -1) * Number(m.monto), 0)
}

export function resumenMes(movimientos, mes) {
  const delMes = movimientos.filter((m) => mesDe(m.fecha) === mes && m.concepto !== CONCEPTO_INICIAL)
  const entradas = delMes.filter((m) => m.tipo === 'entrada').reduce((s, m) => s + Number(m.monto), 0)
  const salidas = delMes.filter((m) => m.tipo === 'salida').reduce((s, m) => s + Number(m.monto), 0)
  const unidadesVendidas = delMes.reduce((s, m) => s + (m.tipo === 'entrada' && m.unidades ? m.unidades : 0), 0)
  return { entradas, salidas, resultado: entradas - salidas, unidadesVendidas, cantidad: delMes.length }
}

// Más reciente primero; dentro del mismo día, el último anotado arriba.
export function porDia(movimientos) {
  const orden = [...movimientos].sort((a, b) =>
    a.fecha === b.fecha ? String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')) : b.fecha.localeCompare(a.fecha),
  )
  const grupos = []
  for (const m of orden) {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.fecha === m.fecha) ultimo.movimientos.push(m)
    else grupos.push({ fecha: m.fecha, movimientos: [m] })
  }
  for (const g of grupos) g.total = saldo(g.movimientos)
  return grupos
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export function nombreMes(mes) {
  const [a, m] = mes.split('-').map(Number)
  return `${MESES[m - 1]} ${a}`
}

export function nombreDia(fecha, referencia = hoy()) {
  if (fecha === referencia) return 'Hoy'
  const [a, m, d] = fecha.split('-').map(Number)
  const f = new Date(a, m - 1, d)
  const [ra, rm, rd] = referencia.split('-').map(Number)
  const dif = Math.round((new Date(ra, rm - 1, rd) - f) / 86400000)
  if (dif === 1) return 'Ayer'
  return `${DIAS[f.getDay()]} ${d} de ${MESES[m - 1]}`
}

export function moverMes(mes, delta) {
  const [a, m] = mes.split('-').map(Number)
  const f = new Date(a, m - 1 + delta, 1)
  return hoy(f).slice(0, 7)
}
