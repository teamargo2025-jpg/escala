// Genera los íconos PNG de ESCALA (para el celular y el manifest) a partir del mismo dibujo del SVG.
// Uso: node scripts/generar-iconos.mjs
import fs from 'node:fs'
import zlib from 'node:zlib'

const FONDO = [0x6d, 0x28, 0xd9]
const BARRAS = [
  { x: 12, y: 38, w: 12, h: 14, color: [0xef, 0xe6, 0xff] },
  { x: 26, y: 26, w: 12, h: 26, color: [0xc4, 0xa5, 0xff] },
  { x: 40, y: 12, w: 12, h: 40, color: [0xff, 0xff, 0xff] },
]

// Rectángulo con esquinas redondeadas, en coordenadas de 0 a 64.
const dentro = (px, py, x, y, w, h, r) => {
  if (px < x || py < y || px > x + w || py > y + h) return false
  const cx = Math.min(Math.max(px, x + r), x + w - r)
  const cy = Math.min(Math.max(py, y + r), y + h - r)
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r
}

function pintar(lado) {
  const pixeles = Buffer.alloc(lado * lado * 4)
  const escala = 64 / lado
  for (let fila = 0; fila < lado; fila++) {
    for (let col = 0; col < lado; col++) {
      const x = (col + 0.5) * escala
      const y = (fila + 0.5) * escala
      let color = null
      if (dentro(x, y, 0, 0, 64, 64, 14)) color = FONDO
      for (const b of BARRAS) if (dentro(x, y, b.x, b.y, b.w, b.h, 2)) color = b.color
      const i = (fila * lado + col) * 4
      if (color) {
        pixeles[i] = color[0]
        pixeles[i + 1] = color[1]
        pixeles[i + 2] = color[2]
        pixeles[i + 3] = 255
      }
    }
  }
  return pixeles
}

const trozo = (tipo, datos) => {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length)
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(cuerpo) >>> 0)
  return Buffer.concat([largo, cuerpo, crc])
}

const TABLA = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = TABLA[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function png(lado) {
  const pixeles = pintar(lado)
  // Cada fila lleva delante un byte de filtro (0 = ninguno).
  const crudo = Buffer.alloc(lado * (lado * 4 + 1))
  for (let fila = 0; fila < lado; fila++) {
    crudo[fila * (lado * 4 + 1)] = 0
    pixeles.copy(crudo, fila * (lado * 4 + 1) + 1, fila * lado * 4, (fila + 1) * lado * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(lado, 0)
  ihdr.writeUInt32BE(lado, 4)
  ihdr[8] = 8 // bits por canal
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', ihdr),
    trozo('IDAT', zlib.deflateSync(crudo, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ])
}

for (const lado of [180, 192, 512]) {
  const archivo = `public/icono-${lado}.png`
  fs.writeFileSync(archivo, png(lado))
  console.log(`${archivo}: ${Math.round(fs.statSync(archivo).size / 1024)} KB`)
}
