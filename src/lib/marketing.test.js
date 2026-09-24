import { test } from 'node:test'
import assert from 'node:assert/strict'
import { FECHAS_CLAVE, diasHasta, fechaDeGrabacion, proximasFechas } from './marketing.js'

test('las fechas móviles caen donde deben', () => {
  const dia = (id, anio) => FECHAS_CLAVE.find((f) => f.id === id).cuando(anio)
  // Día de la Madre 2026: domingo 10 de mayo.
  const madre = dia('dia-madre', 2026)
  assert.equal(madre.getMonth(), 4)
  assert.equal(madre.getDate(), 10)
  assert.equal(madre.getDay(), 0)
  // Día del Padre 2026: domingo 21 de junio.
  const padre = dia('dia-padre', 2026)
  assert.equal(padre.getDate(), 21)
  assert.equal(padre.getDay(), 0)
  // Black Friday 2026: viernes 27 de noviembre.
  const bf = dia('black-friday', 2026)
  assert.equal(bf.getDate(), 27)
  assert.equal(bf.getDay(), 5)
})

test('las próximas fechas salen ordenadas y sin repetir', () => {
  const p = proximasFechas('2026-09-24', 4)
  assert.deepEqual(p.map((f) => f.id), ['cancion-criolla', 'black-friday', 'navidad', 'año-nuevo'])
  assert.equal(p[0].dias, diasHasta('2026-10-31', '2026-09-24'))
  // El Año Nuevo que viene es el del año siguiente.
  assert.equal(p[3].fecha, '2027-01-01')
  assert.equal(new Set(p.map((f) => f.id)).size, p.length)
})

test('la grabación se propone dos semanas antes, nunca en el pasado', () => {
  assert.equal(fechaDeGrabacion('2026-12-25', '2026-09-24'), '2026-12-11')
  assert.equal(fechaDeGrabacion('2026-09-30', '2026-09-24'), '2026-09-24')
})
