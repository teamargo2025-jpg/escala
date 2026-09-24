import { test } from 'node:test'
import assert from 'node:assert/strict'
import { estadoLecciones } from './educacion.js'
import { LECCIONES } from '../data/educacion.js'
import { seccionesResumen } from './resumen.js'
import { calcular } from './calc.js'
import { RUBROS } from '../data/rubros.js'

test('las lecciones se abren de a una, en orden', () => {
  const e = estadoLecciones({})
  assert.equal(e.lista[0].estado, 'abierta')
  assert.equal(e.lista[1].estado, 'bloqueada')
  assert.equal(e.siguiente, LECCIONES[0].id)
  assert.equal(e.completadas, 0)

  const e2 = estadoLecciones({ [LECCIONES[0].id]: true })
  assert.equal(e2.lista[0].estado, 'hecha')
  assert.equal(e2.lista[1].estado, 'abierta')
  assert.equal(e2.lista[2].estado, 'bloqueada')
  assert.equal(e2.siguiente, LECCIONES[1].id)

  const todas = Object.fromEntries(LECCIONES.map((l) => [l.id, true]))
  const e3 = estadoLecciones(todas)
  assert.equal(e3.terminado, true)
  assert.equal(e3.siguiente, null)
  assert.equal(e3.modulos.length, 3)
  assert.equal(e3.modulos.reduce((s, m) => s + m.lecciones.length, 0), LECCIONES.length)
})

test('la formalización está al final y explica el Nuevo RUS', () => {
  const ids = LECCIONES.map((l) => l.id)
  assert.ok(ids.indexOf('formalizar') > ids.indexOf('separar'))
  assert.equal(ids[ids.length - 1], 'nrus')
  const nrus = LECCIONES.find((l) => l.id === 'nrus')
  const texto = nrus.tarjetas(RUBROS.costura, calcular({ arranque: [], fijos: [], variables: [], flujo: [] }), {}).join(' ')
  assert.match(texto, /RUC/)
  assert.match(texto, /S\/ 20/)
})

test('el resumen junta los números de cada apartado ya hecho', () => {
  const m = (precio) => ({ marcado: true, precio })
  const datos = {
    arranque: [m('1000')],
    fijos: [m('400')],
    variables: [m('10')],
    cantidad: '100',
    ganancia: 30,
    metaGanancia: '600',
    flujo: ['50', '100', '100'],
    hechos: { presupuesto: true, costos: true, precio: true, meta: true, flujo: true },
    educacion: { separar: true },
    inventario: { materiales: [{ id: 'a', nombre: 'Tela', medida: 'metros', stock: 10, costo: 8, minimo: 0 }], movimientos: [] },
    productos: [{ id: 'p', nombre: 'Polo', materiales: [{ materialId: 'a', cantidad: '1' }], horas: '0', precioVenta: '5' }],
  }
  const s = seccionesResumen({ datos, n: calcular(datos), movimientos: [], r: RUBROS.costura, meses: 3 })
  const ids = s.map((x) => x.id)
  assert.deepEqual(ids, ['presupuesto', 'costos', 'precio', 'meta', 'flujo', 'inventario', 'costeo', 'educacion'])
  assert.equal(s[0].filas[0].valor, 'S/ 1,000')
  assert.equal(s.find((x) => x.id === 'precio').filas[1].valor, 'S/ 18.50')
  // Un producto que se vende por debajo de su costo se marca en rojo.
  assert.equal(s.find((x) => x.id === 'costeo').filas[0].tono, 'neg')
  assert.equal(s.find((x) => x.id === 'educacion').filas[0].valor, `1 de ${LECCIONES.length}`)
})
