import { test } from 'node:test'
import assert from 'node:assert/strict'
import { claveApodo, validarApodo, validarDocumento, limpiarDocumento, correoDeApodo } from './cuenta.js'
import { estadoApartados } from './apartados.js'
import { saldo, resumenMes, porDia, nombreDia, moverMes } from './caja.js'

test('el apodo ignora tildes, mayúsculas y espacios', () => {
  assert.equal(claveApodo('  María  José '), 'mariajose')
  assert.equal(claveApodo('ROSA-2'), 'rosa2')
  assert.equal(validarApodo('a'), 'Escribe al menos 2 letras.')
  assert.equal(validarApodo('Ño'), null)
  assert.match(correoDeApodo('Rosa T'), /^rosat@/)
})

test('DNI y carné', () => {
  assert.equal(validarDocumento('4567 8912'), null)
  assert.equal(limpiarDocumento('45.678.912'), '45678912')
  assert.notEqual(validarDocumento('1234567'), null)
  assert.notEqual(validarDocumento('123456789'), null)
  assert.equal(validarDocumento('001234567', 'ce'), null)
  assert.notEqual(validarDocumento('12345678', 'ce'), null)
})

test('apartados: dependencias y siguiente sugerido', () => {
  let e = estadoApartados({})
  assert.equal(e.siguiente, 'presupuesto')
  assert.equal(e.lista.find((a) => a.id === 'precio').estado, 'bloqueado')
  assert.equal(e.lista.find((a) => a.id === 'caja').estado, 'disponible')
  e = estadoApartados({ presupuesto: true, costos: true })
  assert.equal(e.siguiente, 'precio')
  e = estadoApartados({ presupuesto: true, costos: true, precio: true, meta: true, flujo: true })
  assert.equal(e.siguiente, null)
  assert.equal(e.planCompleto, true)
})

test('caja: saldo, mes y agrupado por día', () => {
  const movs = [
    { fecha: '2026-09-14', tipo: 'entrada', monto: '66', unidades: 3, created_at: '1' },
    { fecha: '2026-09-15', tipo: 'salida', monto: 20, created_at: '2' },
    { fecha: '2026-09-15', tipo: 'entrada', monto: 44, unidades: 2, created_at: '3' },
    { fecha: '2026-08-30', tipo: 'salida', monto: 10, created_at: '0' },
    { fecha: '2026-09-01', tipo: 'entrada', monto: 100, concepto: 'Dinero con el que empiezo', created_at: '0' },
  ]
  assert.equal(saldo(movs), 180)
  const r = resumenMes(movs, '2026-09')
  assert.deepEqual([r.entradas, r.salidas, r.resultado, r.unidadesVendidas], [110, 20, 90, 5])
  const g = porDia(movs)
  assert.deepEqual(g.map((x) => x.fecha), ['2026-09-15', '2026-09-14', '2026-09-01', '2026-08-30'])
  assert.equal(g[0].movimientos[0].created_at, '3')
  assert.equal(g[0].total, 24)
  assert.equal(nombreDia('2026-09-15', '2026-09-15'), 'Hoy')
  assert.equal(nombreDia('2026-09-14', '2026-09-15'), 'Ayer')
  assert.equal(nombreDia('2026-09-01', '2026-09-15'), 'martes 1 de septiembre')
  assert.equal(moverMes('2026-01', -1), '2025-12')
})
