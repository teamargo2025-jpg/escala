// Simulador y comparador de créditos.
//
// Todo se calcula con la TCEA (Tasa de Costo Efectivo Anual), que es la que de verdad
// importa: incluye intereses, seguro de desgravamen, portes y comisiones. La TEA sola
// esconde esos cobros, y por eso dos créditos con la misma TEA pueden costar distinto.
import { num } from './calc.js'

const redondear = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d

// La TCEA es anual y efectiva: para pasarla a mensual no se divide entre 12,
// se saca la raíz doceava. Dividir entre 12 da un número más bajo que el real.
export function tasaMensual(tcea) {
  const t = num(tcea) / 100
  if (t <= 0) return 0
  return (1 + t) ** (1 / 12) - 1
}

// El camino inverso: el prestamista del mercado cobra "10% al mes" y nadie sabe
// cuánto es al año. Esto lo traduce para poder compararlo con el banco.
export function tceaDesdeMensual(tasaMes) {
  const i = num(tasaMes) / 100
  if (i <= 0) return 0
  return redondear(((1 + i) ** 12 - 1) * 100)
}

// Cuota fija mensual (sistema francés, el que usan bancos y cajas en Perú).
export function simular({ monto, meses, tcea, tasaMes }) {
  const p = num(monto)
  const n = Math.floor(num(meses))
  if (p <= 0 || n <= 0) return null

  const anual = tasaMes != null && num(tasaMes) > 0 ? tceaDesdeMensual(tasaMes) : num(tcea)
  const i = tasaMes != null && num(tasaMes) > 0 ? num(tasaMes) / 100 : tasaMensual(anual)

  // Sin interés la cuota es simplemente el monto repartido.
  const cuota = i > 0 ? (p * i) / (1 - (1 + i) ** -n) : p / n
  const total = cuota * n
  return {
    monto: p,
    meses: n,
    tcea: redondear(anual),
    tasaMes: redondear(i * 100, 3),
    cuota: redondear(cuota),
    total: redondear(total),
    interes: redondear(total - p),
    // "De cada S/ 100 que te prestan, devuelves S/ X". Es la forma en que la gente lo entiende.
    porCada100: redondear((total / p) * 100),
  }
}

// Ordena de la más barata a la más cara por el TOTAL que se devuelve, no por la cuota:
// un plazo largo baja la cuota y sube el total, y ahí es donde la gente se confunde.
export function comparar(opciones = []) {
  const hechas = opciones
    .map((o) => {
      const s = simular(o)
      return s && { ...o, ...s }
    })
    .filter(Boolean)
  if (!hechas.length) return []

  const ordenadas = [...hechas].sort((a, b) => a.total - b.total)
  const barata = ordenadas[0]
  return ordenadas.map((o, i) => ({
    ...o,
    mejor: i === 0,
    // Cuánto más caro sale que la opción más barata, en soles de bolsillo.
    masCaro: redondear(o.total - barata.total),
  }))
}

// Lo que ESCALA puede decir y un simulador de banco no: si el negocio aguanta la cuota.
// `aportaUnidad` es lo que deja cada venta después de materiales y mano de obra.
export function esfuerzoDePago({ cuota, aportaUnidad, gananciaMes }) {
  const c = num(cuota)
  const aporta = num(aportaUnidad)
  const ganancia = num(gananciaMes)
  return {
    cuota: c,
    // Unidades extra que hay que vender cada mes solo para pagar la cuota.
    ventasExtra: aporta > 0 ? Math.ceil(c / aporta - 1e-9) : null,
    // Qué parte de la ganancia del mes se va en la cuota.
    parteDeGanancia: ganancia > 0 ? redondear(c / ganancia, 4) : null,
    // Señal de alarma: más de la mitad de la ganancia es demasiado.
    riesgo: ganancia > 0 ? (c > ganancia ? 'no_alcanza' : c > ganancia * 0.5 ? 'ajustado' : 'alcanza') : null,
  }
}
