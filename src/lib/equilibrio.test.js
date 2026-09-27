import { test } from 'node:test'
import assert from 'node:assert/strict'
import { elQueMasDeja, equilibrioMezcla, lineasDeProductos } from './equilibrio.js'

const materiales = [
  { id: 'tela', nombre: 'Tela', medida: 'metros', stock: 50, costo: 10 },
  { id: 'hilo', nombre: 'Hilo', medida: 'conos', stock: 5, costo: 2 },
]

// Polo: 2 m de tela (20) + 1 hora (5) = 25 de variable, se vende a 45 → aporta 20.
// Bolso: 1 m de tela (10) + 1 hilo (2) + 2 horas (10) = 22, se vende a 40 → aporta 18.
const productos = [
  { id: 'polo', nombre: 'Polo', horas: '1', precioVenta: '45', ventasMes: '30', materiales: [{ materialId: 'tela', cantidad: '2' }] },
  {
    id: 'bolso', nombre: 'Bolso', horas: '2', precioVenta: '40', ventasMes: '10',
    materiales: [{ materialId: 'tela', cantidad: '1' }, { materialId: 'hilo', cantidad: '1' }],
  },
]

const lineas = () => lineasDeProductos(productos, materiales, { valorHora: 5 })

test('cada línea calcula su costo variable y lo que aporta', () => {
  const [polo, bolso] = lineas()
  assert.equal(polo.variable, 25)
  assert.equal(polo.aporta, 20)
  assert.equal(bolso.variable, 22)
  assert.equal(bolso.aporta, 18)
  assert.ok(polo.completo && bolso.completo)
})

test('los pagos del mes no entran al costo variable', () => {
  const [polo] = lineasDeProductos(productos, materiales, { valorHora: 5, fijoPorUnidad: 999 })
  assert.equal(polo.variable, 25)
})

test('el equilibrio se da en soles de venta según la mezcla', () => {
  // Ventas del plan: 30×45 + 10×40 = 1750. Aporte: 30×20 + 10×18 = 780.
  const r = equilibrioMezcla(lineas(), 390)
  assert.equal(r.ventasPlan, 1750)
  assert.equal(r.aportePlan, 780)
  assert.ok(Math.abs(r.razon - 780 / 1750) < 1e-9)
  // 390 / 0.4457 = 875: justo la mitad del plan, porque los fijos son la mitad del aporte.
  assert.ok(Math.abs(r.soles - 875) < 1e-6)
  assert.ok(Math.abs(r.veces - 0.5) < 1e-9)
  assert.equal(r.resultadoPlan, 390)
  assert.equal(r.alcanza, true)
})

test('el desglose reparte las unidades con el mismo peso de la mezcla', () => {
  const r = equilibrioMezcla(lineas(), 390)
  const [polo, bolso] = r.detalle
  assert.equal(polo.unidades, 15) // la mitad de 30
  assert.equal(bolso.unidades, 5) // la mitad de 10
  assert.ok(Math.abs(polo.peso - 1350 / 1750) < 1e-9)
  assert.ok(Math.abs(polo.soles + bolso.soles - r.soles) < 1e-6)
})

test('con meta de ganancia pide vender más', () => {
  const r = equilibrioMezcla(lineas(), 390, 390)
  assert.ok(Math.abs(r.solesMeta - 1750) < 1e-6)
})

test('avisa cuando el plan no llega a cubrir los pagos', () => {
  const r = equilibrioMezcla(lineas(), 1000)
  assert.equal(r.alcanza, false)
  assert.equal(r.resultadoPlan, -220)
})

test('sin precios o sin mezcla no se puede calcular', () => {
  assert.equal(equilibrioMezcla(lineasDeProductos([{ ...productos[0], precioVenta: '' }], materiales), 300), null)
  assert.equal(equilibrioMezcla(lineasDeProductos([{ ...productos[0], ventasMes: '' }], materiales), 300), null)
  assert.equal(equilibrioMezcla([], 300), null)
})

test('cuenta los productos que quedaron fuera del cálculo', () => {
  const sueltos = [...productos, { id: 'x', nombre: 'Gorro', horas: '', precioVenta: '', ventasMes: '', materiales: [] }]
  const r = equilibrioMezcla(lineasDeProductos(sueltos, materiales, { valorHora: 5 }), 390)
  assert.equal(r.sinDatos, 1)
})

test('el que más deja es el de mejor margen sobre su precio', () => {
  // Polo: 20/45 = 44%. Bolso: 18/40 = 45%.
  assert.equal(elQueMasDeja(lineas()).id, 'bolso')
  assert.equal(elQueMasDeja([]), null)
})
