import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mixDelMes, porProducto, ventasDelMes, ventasSueltas } from './ventas.js'

const materiales = [{ id: 'tela', nombre: 'Tela', medida: 'metros', stock: 50, costo: 10 }]

// Polo: 2 m de tela (20) + 1 hora (5) = 25 de variable. Bolso: 1 m (10) + 2 horas (10) = 20.
const productos = [
  { id: 'polo', nombre: 'Polo', horas: '1', precioVenta: '45', materiales: [{ materialId: 'tela', cantidad: '2' }] },
  { id: 'bolso', nombre: 'Bolso', horas: '2', precioVenta: '40', materiales: [{ materialId: 'tela', cantidad: '1' }] },
  { id: 'gorro', nombre: 'Gorro', horas: '', precioVenta: '', materiales: [] },
]

const movimientos = [
  { id: '1', fecha: '2026-09-03', tipo: 'entrada', concepto: 'Venta de Polo', unidades: 2, monto: 90, productoId: 'polo' },
  { id: '2', fecha: '2026-09-20', tipo: 'entrada', concepto: 'Venta de Polo', unidades: 1, monto: 40, productoId: 'polo' }, // rebajado
  { id: '3', fecha: '2026-09-21', tipo: 'entrada', concepto: 'Venta de Bolso', unidades: 3, monto: 120, productoId: 'bolso' },
  { id: '4', fecha: '2026-08-15', tipo: 'entrada', concepto: 'Venta de Polo', unidades: 5, monto: 225, productoId: 'polo' }, // otro mes
  { id: '5', fecha: '2026-09-22', tipo: 'entrada', concepto: 'Arreglo de ropa', unidades: 1, monto: 30, productoId: null },
  { id: '6', fecha: '2026-09-22', tipo: 'salida', concepto: 'Tela', unidades: null, monto: 100, productoId: null },
]

const opciones = { valorHora: 5, mes: '2026-09' }

test('solo cuenta entradas con producto, del mes pedido', () => {
  assert.equal(ventasDelMes(movimientos, '2026-09').length, 3)
  assert.equal(ventasDelMes(movimientos, '2026-08').length, 1)
  assert.equal(ventasDelMes(movimientos).length, 4) // sin mes: todas
})

test('suma unidades y lo cobrado de verdad, no el precio de la ficha', () => {
  const filas = porProducto(movimientos, productos, materiales, opciones)
  const polo = filas.find((f) => f.id === 'polo')
  assert.equal(polo.unidades, 3)
  assert.equal(polo.ingreso, 130) // 90 + 40, aunque la ficha diga 45 cada uno
  assert.equal(polo.ventas, 2)
  assert.equal(polo.gana, 130 - 25 * 3) // 55
})

test('ordena por lo que deja, no por lo que factura', () => {
  const filas = porProducto(movimientos, productos, materiales, opciones)
  // Bolso: cobró 120 y su variable es 20×3 = 60 → deja 60. Polo deja 55, aunque vendió más veces.
  assert.deepEqual(filas.map((f) => f.id), ['bolso', 'polo'])
  assert.equal(filas[0].gana, 60)
})

test('los productos que no se vendieron no aparecen', () => {
  const filas = porProducto(movimientos, productos, materiales, opciones)
  assert.equal(filas.some((f) => f.id === 'gorro'), false)
})

test('el margen es sobre lo cobrado', () => {
  const [bolso] = porProducto(movimientos, productos, materiales, opciones)
  assert.ok(Math.abs(bolso.margen - 60 / 120) < 1e-9)
  assert.equal(porProducto([], productos, materiales, opciones).length, 0)
})

test('las ventas sin ficha quedan aparte', () => {
  const sueltas = ventasSueltas(movimientos, '2026-09')
  assert.equal(sueltas.length, 1)
  assert.equal(sueltas[0].concepto, 'Arreglo de ropa')
})

test('la mezcla del mes sale de lo vendido', () => {
  assert.deepEqual(mixDelMes(movimientos, productos, '2026-09'), { polo: 3, bolso: 3 })
  assert.deepEqual(mixDelMes(movimientos, productos, '2026-08'), { polo: 5 })
  assert.deepEqual(mixDelMes([], productos, '2026-09'), {})
})
