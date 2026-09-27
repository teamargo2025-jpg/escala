// Punto de equilibrio cuando hay varios productos o servicios.
//
// Con un solo producto el equilibrio se cuenta en unidades. Con varios no se puede:
// una torta y un alfajor no son "uno" y "uno". Por eso se calcula en SOLES DE VENTA,
// usando el peso que tiene cada producto en las ventas del mes (la mezcla).
import { num } from './calc.js'
import { costoProducto } from './inventario.js'

// Costo variable = materiales + tu tiempo. Los pagos del mes (fijos) NO entran aquí:
// justamente son los que el punto de equilibrio tiene que cubrir.
export function lineaDeProducto(producto, materiales, { valorHora = 0 } = {}) {
  const c = costoProducto(producto, materiales, { valorHora, fijoPorUnidad: 0 })
  const precio = num(producto.precioVenta)
  const variable = c.deMateriales + c.manoObra
  const aporta = precio - variable
  return {
    id: producto.id,
    nombre: producto.nombre,
    precio,
    variable,
    aporta, // margen de contribución: lo que deja cada venta para los pagos del mes
    ventasMes: Math.floor(num(producto.ventasMes)),
    margen: precio > 0 ? aporta / precio : 0,
    completo: precio > 0 && variable > 0,
  }
}

export function lineasDeProductos(productos = [], materiales = [], opciones) {
  return productos.map((p) => lineaDeProducto(p, materiales, opciones))
}

// Devuelve null cuando todavía no alcanza para calcular (sin precios o sin mezcla).
export function equilibrioMezcla(lineas, fijos, metaGanancia = 0) {
  const usadas = lineas.filter((l) => l.precio > 0 && l.aporta > 0 && l.ventasMes > 0)
  if (!usadas.length) return null

  const ventasPlan = usadas.reduce((s, l) => s + l.precio * l.ventasMes, 0)
  const aportePlan = usadas.reduce((s, l) => s + l.aporta * l.ventasMes, 0)
  if (ventasPlan <= 0 || aportePlan <= 0) return null

  // De cada sol que vendes, esta parte queda para pagar el mes.
  const razon = aportePlan / ventasPlan
  const soles = fijos / razon
  const solesMeta = metaGanancia > 0 ? (fijos + metaGanancia) / razon : null

  // El mismo reparto de la mezcla, encogido o estirado hasta llegar al equilibrio.
  const veces = ventasPlan > 0 ? soles / ventasPlan : 0
  const detalle = usadas.map((l) => ({
    ...l,
    peso: (l.precio * l.ventasMes) / ventasPlan,
    unidades: Math.ceil(l.ventasMes * veces - 1e-9),
    soles: l.precio * l.ventasMes * veces,
  }))

  return {
    razon,
    ventasPlan,
    aportePlan,
    fijos,
    soles,
    solesMeta,
    veces,
    detalle,
    resultadoPlan: aportePlan - fijos, // lo que ganarías si vendes tu mezcla tal cual
    alcanza: ventasPlan >= soles,
    sinDatos: lineas.length - usadas.length,
  }
}

// El producto que más aporta por sol vendido: el que conviene empujar.
export function elQueMasDeja(lineas) {
  const usadas = lineas.filter((l) => l.completo && l.aporta > 0)
  if (!usadas.length) return null
  return usadas.reduce((mejor, l) => (l.margen > mejor.margen ? l : mejor))
}
