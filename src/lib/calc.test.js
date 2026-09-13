import { test } from 'node:test'
import assert from 'node:assert/strict'
import { num, precioDeVenta, calcular } from './calc.js'

test('num acepta coma decimal y basura', () => {
  assert.equal(num('12,50'), 12.5)
  assert.equal(num(''), 0)
  assert.equal(num('abc'), 0)
  assert.equal(num('-5'), 0)
})

test('precio sobre el costo, redondeado a 0.50', () => {
  assert.equal(precioDeVenta(10, 30, 'sobre_costo', 0.5), 13)
  assert.equal(precioDeVenta(10.1, 30, 'sobre_costo', 0.5), 13.5)
  assert.equal(precioDeVenta(10, 30, 'sobre_costo', 0), 13)
})

test('precio sobre el precio', () => {
  assert.equal(precioDeVenta(70, 30, 'sobre_precio', 0), 100)
})

test('recorrido completo', () => {
  const m = (precio) => ({ marcado: true, precio })
  const r = calcular({
    arranque: [m('1000'), { marcado: false, precio: '500' }],
    fijos: [m('300'), m('100')],
    variables: [m('8'), m('2')],
    cantidad: '100',
    ganancia: 30,
    metaGanancia: '600',
    flujo: ['50', '100', '100'],
  })
  assert.equal(r.inversion, 1000)
  assert.equal(r.fijos, 400)
  assert.equal(r.variableUnidad, 10)
  assert.equal(r.costoUnidad, 14)
  assert.equal(r.precio, 18.5) // 14 × 1.3 = 18.2 → 18.5
  assert.equal(r.equilibrio, 48) // 400 / 8.5 = 47.06
  assert.equal(r.unidadesMeta, 118) // 1000 / 8.5 = 117.6
  assert.equal(r.meses[0].resultado, 50 * 18.5 - 400 - 500)
  assert.equal(r.saldoFinal, -1000 + r.totalFlujo)
})
