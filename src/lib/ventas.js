// Qué se vendió de cada producto, según lo anotado en la caja.
//
// El precio de la ficha dice lo que "debería" dejar cada venta; esto dice lo que
// dejó de verdad, con lo que la persona realmente vendió y cobró.
import { num } from './calc.js'
import { mesDe } from './caja.js'
import { costoProducto } from './inventario.js'

const esVenta = (m) => m.tipo === 'entrada' && m.productoId

export function ventasDelMes(movimientos = [], mes) {
  return movimientos.filter((m) => esVenta(m) && (!mes || mesDe(m.fecha) === mes))
}

// Una fila por producto vendido, de la que más deja a la que menos.
// `ingreso` es lo cobrado de verdad; `gana` descuenta materiales y mano de obra.
export function porProducto(movimientos = [], productos = [], materiales = [], { valorHora = 0, mes } = {}) {
  const ventas = ventasDelMes(movimientos, mes)
  const filas = productos.map((p) => {
    const mias = ventas.filter((m) => m.productoId === p.id)
    const unidades = mias.reduce((s, m) => s + Math.max(0, Math.floor(num(m.unidades))), 0)
    const ingreso = mias.reduce((s, m) => s + num(m.monto), 0)
    const c = costoProducto(p, materiales, { valorHora, fijoPorUnidad: 0 })
    const variable = c.deMateriales + c.manoObra
    return {
      id: p.id,
      nombre: p.nombre,
      unidades,
      ventas: mias.length,
      ingreso,
      variable,
      gana: ingreso - variable * unidades,
      // Lo que queda de cada sol cobrado, después de materiales y tu tiempo.
      margen: ingreso > 0 ? (ingreso - variable * unidades) / ingreso : 0,
    }
  })
  return filas.filter((f) => f.unidades > 0 || f.ingreso > 0).sort((a, b) => b.gana - a.gana)
}

// Ventas sin ficha: anotadas antes de crear los productos, o vendidas como "otro".
export function ventasSueltas(movimientos = [], mes) {
  return movimientos.filter((m) => m.tipo === 'entrada' && !m.productoId && num(m.unidades) > 0 && (!mes || mesDe(m.fecha) === mes))
}

// Cuántos se vendió de cada producto, para llenar la mezcla del punto de equilibrio
// con lo que pasó de verdad en vez de pedirle a la persona que lo adivine.
export function mixDelMes(movimientos = [], productos = [], mes) {
  const ventas = ventasDelMes(movimientos, mes)
  const mix = {}
  for (const p of productos) {
    const unidades = ventas
      .filter((m) => m.productoId === p.id)
      .reduce((s, m) => s + Math.max(0, Math.floor(num(m.unidades))), 0)
    if (unidades > 0) mix[p.id] = unidades
  }
  return mix
}
