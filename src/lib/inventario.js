// Inventario de materiales y costeo por producto (según lo que cada producto utiliza).
// Funciones puras: los ids y fechas llegan desde afuera.
import { num, precioDeVenta } from './calc.js'

export const MEDIDAS = ['unidades', 'metros', 'kilos', 'litros', 'conos', 'frascos', 'tubos', 'barras', 'galones', 'paquetes']
export const MAX_MOVIMIENTOS = 400

export const inventarioVacio = () => ({ materiales: [], movimientos: [] })

const redondear = (n, d = 4) => Math.round(n * 10 ** d) / 10 ** d

export function fmtCantidad(n) {
  return Number(redondear(n, 2)).toLocaleString('es-PE', { maximumFractionDigits: 2 })
}

// Aplica una compra, un uso o un conteo al stock (y al costo promedio, si es compra).
// mov: { id, fecha, materialId, tipo: 'compra' | 'uso' | 'ajuste', cantidad, costoTotal?, nota? }
export function aplicarMovimiento(inv, mov) {
  const q = num(mov.cantidad)
  let registro = { ...mov, cantidad: q }
  const materiales = inv.materiales.map((m) => {
    if (m.id !== mov.materialId) return m
    const stock = Number(m.stock) || 0
    if (mov.tipo === 'compra') {
      const total = num(mov.costoTotal)
      const previo = Math.max(0, stock)
      // Costo promedio: lo que ya había a su costo + lo nuevo a su precio.
      const costo = previo + q > 0 && total > 0 ? (previo * (Number(m.costo) || 0) + total) / (previo + q) : Number(m.costo) || 0
      registro = { ...registro, costoTotal: total }
      return { ...m, stock: redondear(stock + q), costo: redondear(costo) }
    }
    if (mov.tipo === 'uso') return { ...m, stock: redondear(Math.max(0, stock - q)) }
    if (mov.tipo === 'ajuste') {
      registro = { ...registro, diferencia: redondear(q - stock) }
      return { ...m, stock: redondear(q) }
    }
    return m
  })
  return { materiales, movimientos: [registro, ...inv.movimientos].slice(0, MAX_MOVIMIENTOS) }
}

// Hacer (o vender) `cantidad` de un producto descuenta de su ficha los materiales que usa.
export function usarProducto(inv, producto, cantidad, { fecha, nuevoId }) {
  const veces = num(cantidad)
  let resultado = inv
  for (const linea of producto.materiales) {
    const q = num(linea.cantidad) * veces
    if (q <= 0 || !inv.materiales.some((m) => m.id === linea.materialId)) continue
    resultado = aplicarMovimiento(resultado, {
      id: nuevoId(),
      fecha,
      materialId: linea.materialId,
      tipo: 'uso',
      cantidad: q,
      nota: `Para ${fmtCantidad(veces)} × ${producto.nombre}`,
    })
  }
  return resultado
}

export function costoProducto(producto, materiales, { valorHora = 0, fijoPorUnidad = 0 } = {}) {
  const lineas = producto.materiales.map((l) => {
    const m = materiales.find((x) => x.id === l.materialId)
    const cantidad = num(l.cantidad)
    const costoUnidad = m ? Number(m.costo) || 0 : 0
    return { ...l, material: m, cantidad, costoUnidad, subtotal: cantidad * costoUnidad, sinCosto: !m || !costoUnidad }
  })
  const deMateriales = lineas.reduce((s, l) => s + l.subtotal, 0)
  const manoObra = num(producto.horas) * num(valorHora)
  const fijos = producto.incluirFijos === false ? 0 : fijoPorUnidad
  const total = deMateriales + manoObra + fijos
  return { lineas, deMateriales, manoObra, fijos, total }
}

export function resultadoPrecio(total, porcentaje, precioActual) {
  const sugerido = precioDeVenta(total, porcentaje)
  const actual = num(precioActual)
  const gananciaActual = actual ? actual - total : null
  return { sugerido, actual, gananciaActual, margenActual: actual && total ? (gananciaActual / total) * 100 : null }
}

export const porAcabarse = (materiales) => materiales.filter((m) => num(m.minimo) > 0 && (Number(m.stock) || 0) <= num(m.minimo))

export const valorInventario = (materiales) =>
  materiales.reduce((s, m) => s + Math.max(0, Number(m.stock) || 0) * (Number(m.costo) || 0), 0)

// Con lo que hay en el inventario, ¿cuántos productos alcanza a hacer?
export function alcanzaPara(producto, materiales) {
  const usados = producto.materiales.filter((l) => num(l.cantidad) > 0)
  if (!usados.length) return null
  return Math.min(
    ...usados.map((l) => {
      const m = materiales.find((x) => x.id === l.materialId)
      return m ? Math.floor(Math.max(0, Number(m.stock) || 0) / num(l.cantidad) + 1e-9) : 0
    }),
  )
}
