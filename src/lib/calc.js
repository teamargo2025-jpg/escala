import { METODO_PRECIO, REDONDEO_PRECIO } from '../config.js'

// Acepta "12,50", "12.5", "", números. Nunca devuelve negativo ni NaN.
export function num(v) {
  if (typeof v === 'number') return Number.isFinite(v) && v > 0 ? v : 0
  const n = parseFloat(String(v ?? '').replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function totalMarcado(items) {
  return items.reduce((s, it) => (it.marcado ? s + num(it.precio) : s), 0)
}

function redondearArriba(n, paso) {
  if (!paso) return Math.round(n * 100) / 100
  return Math.ceil(Math.round((n / paso) * 1e6) / 1e6) * paso
}

export function precioDeVenta(costoUnidad, porcentaje, metodo = METODO_PRECIO, paso = REDONDEO_PRECIO) {
  if (costoUnidad <= 0) return 0
  const p = porcentaje / 100
  const bruto = metodo === 'sobre_precio' ? costoUnidad / (1 - Math.min(p, 0.95)) : costoUnidad * (1 + p)
  return redondearArriba(bruto, paso)
}

// Todos los números del recorrido, derivados del estado guardado.
export function calcular(estado) {
  const inversion = totalMarcado(estado.arranque)
  const fijos = totalMarcado(estado.fijos)
  const variableUnidad = totalMarcado(estado.variables)
  const cantidad = Math.floor(num(estado.cantidad))
  const fijoPorUnidad = cantidad > 0 ? fijos / cantidad : 0
  const costoUnidad = variableUnidad + fijoPorUnidad
  const precio = precioDeVenta(costoUnidad, estado.ganancia)
  const gananciaUnidad = precio - costoUnidad
  // Lo que deja cada venta para pagar los fijos (margen de contribución).
  const aportaUnidad = precio - variableUnidad

  const metaGanancia = num(estado.metaGanancia)
  const equilibrio = aportaUnidad > 0 ? Math.ceil(fijos / aportaUnidad - 1e-9) : null
  const unidadesMeta = aportaUnidad > 0 && metaGanancia > 0 ? Math.ceil((fijos + metaGanancia) / aportaUnidad - 1e-9) : null

  const meses = (estado.flujo || []).map((v) => {
    const u = Math.floor(num(v))
    const ingresos = u * precio
    const egresos = fijos + u * variableUnidad
    return { unidades: u, ingresos, variables: u * variableUnidad, fijos, egresos, resultado: ingresos - egresos }
  })
  let saldo = -inversion
  for (const m of meses) {
    saldo += m.resultado
    m.saldo = saldo
  }
  const totalFlujo = meses.reduce((s, m) => s + m.resultado, 0)

  return {
    inversion, fijos, variableUnidad, cantidad, fijoPorUnidad, costoUnidad,
    precio, gananciaUnidad, aportaUnidad, metaGanancia, equilibrio, unidadesMeta,
    meses, totalFlujo, saldoFinal: saldo,
  }
}

export function soles(n, { decimales } = {}) {
  const abs = Math.abs(n)
  const d = decimales ?? (Number.isInteger(Math.round(abs * 100) / 100) ? 0 : 2)
  const txt = abs.toLocaleString('es-PE', { minimumFractionDigits: d, maximumFractionDigits: d })
  // Espacios no separables: "S/ 800" nunca se parte en dos líneas.
  return `${n < 0 ? '− ' : ''}S/ ${txt}`
}
