import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  aplicarMovimiento, alcanzaPara, costoProducto, inventarioVacio, porAcabarse, resultadoPrecio, usarProducto, valorInventario,
} from './inventario.js'

const base = () => ({
  ...inventarioVacio(),
  materiales: [
    { id: 'tela', nombre: 'Tela', medida: 'metros', stock: 10, costo: 8, minimo: 5 },
    { id: 'hilo', nombre: 'Hilo', medida: 'conos', stock: 1, costo: 5, minimo: 0 },
  ],
})

test('compra actualiza stock y costo promedio', () => {
  const inv = aplicarMovimiento(base(), { id: 'm1', fecha: '2026-09-15', materialId: 'tela', tipo: 'compra', cantidad: '10', costoTotal: '100' })
  const tela = inv.materiales[0]
  assert.equal(tela.stock, 20)
  assert.equal(tela.costo, 9) // (10×8 + 100) / 20
  assert.equal(inv.movimientos[0].costoTotal, 100)
})

test('uso no baja de cero y el conteo guarda la diferencia', () => {
  let inv = aplicarMovimiento(base(), { id: 'm1', materialId: 'hilo', tipo: 'uso', cantidad: 3 })
  assert.equal(inv.materiales[1].stock, 0)
  inv = aplicarMovimiento(base(), { id: 'm2', materialId: 'tela', tipo: 'ajuste', cantidad: '7,5' })
  assert.equal(inv.materiales[0].stock, 7.5)
  assert.equal(inv.movimientos[0].diferencia, -2.5)
})

test('costeo por producto: materiales + mano de obra + pagos del mes', () => {
  const polo = { id: 'p', nombre: 'Polo', materiales: [{ materialId: 'tela', cantidad: '0,8' }, { materialId: 'hilo', cantidad: 0.05 }], horas: '0.5' }
  const c = costoProducto(polo, base().materiales, { valorHora: 6, fijoPorUnidad: 4.1 })
  assert.equal(Math.round(c.deMateriales * 100) / 100, 6.65) // 0.8×8 + 0.05×5
  assert.equal(c.manoObra, 3)
  assert.equal(Math.round(c.total * 100) / 100, 13.75)
  const sinFijos = costoProducto({ ...polo, incluirFijos: false }, base().materiales, { valorHora: 6, fijoPorUnidad: 4.1 })
  assert.equal(sinFijos.fijos, 0)
  const r = resultadoPrecio(c.total, 30, '15')
  assert.equal(r.sugerido, 18)
  assert.equal(Math.round(r.gananciaActual * 100) / 100, 1.25)
})

test('usar un producto descuenta su receta y calcula cuántos alcanzan', () => {
  const polo = { id: 'p', nombre: 'Polo', materiales: [{ materialId: 'tela', cantidad: 0.8 }, { materialId: 'hilo', cantidad: 0.05 }] }
  assert.equal(alcanzaPara(polo, base().materiales), 12) // tela 10/0.8 = 12.5; hilo 1/0.05 = 20
  let n = 0
  const inv = usarProducto(base(), polo, 5, { fecha: '2026-09-15', nuevoId: () => `u${n++}` })
  assert.equal(inv.materiales[0].stock, 6)
  assert.equal(inv.materiales[1].stock, 0.75)
  assert.equal(inv.movimientos.length, 2)
  assert.deepEqual(porAcabarse(inv.materiales).map((m) => m.id), [])
  assert.deepEqual(porAcabarse(aplicarMovimiento(inv, { materialId: 'tela', tipo: 'uso', cantidad: 1 }).materiales).map((m) => m.id), ['tela'])
  assert.equal(valorInventario(base().materiales), 85)
})
