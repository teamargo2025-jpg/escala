import { test } from 'node:test'
import assert from 'node:assert/strict'
import { comparar, esfuerzoDePago, simular, tasaMensual, tceaDesdeMensual } from './credito.js'

const cerca = (a, b, tol = 0.02) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`)

test('la TCEA anual se pasa a mensual con raíz doceava, no dividiendo entre 12', () => {
  // 51.11% anual → 3.50% mensual. Dividir entre 12 daría 4.26%: muy lejos.
  cerca(tasaMensual(51.11) * 100, 3.5, 0.01)
  cerca(tasaMensual(45.68) * 100, 3.185, 0.01)
  assert.equal(tasaMensual(0), 0)
})

test('una tasa mensual de prestamista se traduce a lo que cuesta al año', () => {
  // "Solo 10% al mes" son 213.8% al año.
  cerca(tceaDesdeMensual(10), 213.84, 0.1)
  cerca(tceaDesdeMensual(20), 791.6, 1)
  assert.equal(tceaDesdeMensual(0), 0)
})

test('Microwd 4 meses: S/ 1000 al 51.11% de TCEA', () => {
  const s = simular({ monto: 1000, meses: 4, tcea: 51.11 })
  cerca(s.cuota, 272.25, 0.5)
  cerca(s.total, 1089, 2)
  cerca(s.interes, 89, 2)
  cerca(s.porCada100, 108.9, 0.2)
})

test('Microwd España 12 meses: S/ 1000 al 45.68% de TCEA', () => {
  const s = simular({ monto: 1000, meses: 12, tcea: 45.68 })
  cerca(s.cuota, 101.58, 0.5)
  cerca(s.total, 1219, 3)
  cerca(s.interes, 219, 3)
})

test('sin interés la cuota es el monto repartido', () => {
  const s = simular({ monto: 1200, meses: 6, tcea: 0 })
  assert.equal(s.cuota, 200)
  assert.equal(s.interes, 0)
})

test('monto o plazo inválidos no devuelven nada', () => {
  assert.equal(simular({ monto: 0, meses: 6, tcea: 40 }), null)
  assert.equal(simular({ monto: 1000, meses: 0, tcea: 40 }), null)
})

test('compara por el total devuelto, no por la cuota', () => {
  const r = comparar([
    { id: 'largo', monto: 1000, meses: 12, tcea: 45.68 }, // cuota chica, total alto
    { id: 'corto', monto: 1000, meses: 4, tcea: 51.11 }, // cuota alta, total bajo
  ])
  assert.equal(r[0].id, 'corto')
  assert.equal(r[0].mejor, true)
  assert.equal(r[0].masCaro, 0)
  assert.ok(r[1].cuota < r[0].cuota) // la cuota más chica...
  assert.ok(r[1].masCaro > 100) // ...pero más de S/ 100 más caro en total
})

test('el prestamista informal entra a la comparación traducido', () => {
  const r = comparar([
    { id: 'microwd', monto: 1000, meses: 4, tcea: 51.11 },
    { id: 'prestamista', monto: 1000, meses: 4, tasaMes: 10 },
  ])
  assert.equal(r[0].id, 'microwd')
  const prestamista = r.find((x) => x.id === 'prestamista')
  cerca(prestamista.tcea, 213.84, 0.5)
  assert.ok(prestamista.masCaro > 150)
})

test('comparar sin opciones válidas devuelve vacío', () => {
  assert.deepEqual(comparar([]), [])
  assert.deepEqual(comparar([{ monto: 0, meses: 4, tcea: 50 }]), [])
})

test('dice cuánto más hay que vender y si la cuota cabe en la ganancia', () => {
  // Cada venta deja S/ 20; la cuota es S/ 272.25 → 14 ventas extra al mes.
  const e = esfuerzoDePago({ cuota: 272.25, aportaUnidad: 20, gananciaMes: 800 })
  assert.equal(e.ventasExtra, 14)
  assert.equal(e.riesgo, 'alcanza')

  assert.equal(esfuerzoDePago({ cuota: 500, aportaUnidad: 20, gananciaMes: 800 }).riesgo, 'ajustado')
  assert.equal(esfuerzoDePago({ cuota: 900, aportaUnidad: 20, gananciaMes: 800 }).riesgo, 'no_alcanza')
})

test('sin datos del negocio no se inventa el esfuerzo', () => {
  const e = esfuerzoDePago({ cuota: 300, aportaUnidad: 0, gananciaMes: 0 })
  assert.equal(e.ventasExtra, null)
  assert.equal(e.riesgo, null)
})
