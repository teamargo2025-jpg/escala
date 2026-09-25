import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MATERIALES, PREMIOS, puntosDe, puntosTotales } from '../data/eco.js'

test('los puntos salen de los kilos y del material', () => {
  assert.equal(puntosDe('plastico', 2), 20)
  assert.equal(puntosDe('carton', 3.4), 17)
  assert.equal(puntosDe('inventado', 5), 0)
  assert.equal(puntosDe('metal', 0), 0)
  assert.equal(
    puntosTotales([
      { material: 'plastico', kilos: 1.5 },
      { material: 'tela', kilos: 2 },
      { material: 'carton', kilos: 4 },
    ]),
    15 + 16 + 20,
  )
  assert.equal(puntosTotales([]), 0)
})

test('los premios están ordenados de más barato a más caro', () => {
  const puntos = PREMIOS.map((p) => p.puntos)
  assert.deepEqual(puntos, [...puntos].sort((a, b) => a - b))
  // Con 10 kilos de plástico alcanza para la asesoría, que es el premio de entrada.
  assert.ok(puntosDe('plastico', 10) >= PREMIOS[0].puntos)
  assert.ok(Object.keys(MATERIALES).length >= 5)
})
