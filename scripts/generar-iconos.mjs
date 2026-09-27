// Genera los íconos PNG de ESCALA a partir del logo (public/logo-escala.png).
// Uso: node scripts/generar-iconos.mjs
// Recorta el margen blanco del logo, lo centra en un cuadrado y guarda los tamaños que piden los celulares.
import fs from 'node:fs'
import zlib from 'node:zlib'

const ORIGEN = 'public/logo-escala.png'
const FONDO = [255, 255, 255] // el logo tiene texto negro: sobre blanco se lee siempre

// ---------- Leer un PNG ----------
function leerPng(archivo) {
  const buf = fs.readFileSync(archivo)
  let i = 8
  let ancho = 0
  let alto = 0
  let bits = 8
  let tipo = 6
  let paleta = null
  const datos = []
  while (i < buf.length) {
    const largo = buf.readUInt32BE(i)
    const tipoTrozo = buf.toString('ascii', i + 4, i + 8)
    const cuerpo = buf.subarray(i + 8, i + 8 + largo)
    if (tipoTrozo === 'IHDR') {
      ancho = cuerpo.readUInt32BE(0)
      alto = cuerpo.readUInt32BE(4)
      bits = cuerpo[8]
      tipo = cuerpo[9]
    } else if (tipoTrozo === 'PLTE') paleta = Buffer.from(cuerpo)
    else if (tipoTrozo === 'IDAT') datos.push(Buffer.from(cuerpo))
    else if (tipoTrozo === 'IEND') break
    i += 12 + largo
  }
  if (bits !== 8) throw new Error('El logo debe ser un PNG de 8 bits por color')
  const canales = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[tipo]
  if (!canales) throw new Error('Tipo de PNG no soportado: ' + tipo)

  const crudo = zlib.inflateSync(Buffer.concat(datos))
  const bpp = canales
  const linea = ancho * bpp
  const pixeles = Buffer.alloc(ancho * alto * 4)
  let previa = Buffer.alloc(linea)
  for (let y = 0; y < alto; y++) {
    const filtro = crudo[y * (linea + 1)]
    const fila = Buffer.from(crudo.subarray(y * (linea + 1) + 1, (y + 1) * (linea + 1)))
    for (let x = 0; x < linea; x++) {
      const a = x >= bpp ? fila[x - bpp] : 0
      const b = previa[x]
      const c = x >= bpp ? previa[x - bpp] : 0
      if (filtro === 1) fila[x] = (fila[x] + a) & 255
      else if (filtro === 2) fila[x] = (fila[x] + b) & 255
      else if (filtro === 3) fila[x] = (fila[x] + ((a + b) >> 1)) & 255
      else if (filtro === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a)
        const pb = Math.abs(p - b)
        const pc = Math.abs(p - c)
        fila[x] = (fila[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255
      }
    }
    previa = fila
    for (let x = 0; x < ancho; x++) {
      const o = (y * ancho + x) * 4
      const s = x * bpp
      if (tipo === 3) {
        const p = fila[s] * 3
        pixeles[o] = paleta[p]
        pixeles[o + 1] = paleta[p + 1]
        pixeles[o + 2] = paleta[p + 2]
        pixeles[o + 3] = 255
      } else if (tipo === 0 || tipo === 4) {
        pixeles[o] = pixeles[o + 1] = pixeles[o + 2] = fila[s]
        pixeles[o + 3] = tipo === 4 ? fila[s + 1] : 255
      } else {
        pixeles[o] = fila[s]
        pixeles[o + 1] = fila[s + 1]
        pixeles[o + 2] = fila[s + 2]
        pixeles[o + 3] = tipo === 6 ? fila[s + 3] : 255
      }
    }
  }
  return { ancho, alto, pixeles }
}

// ---------- Escribir un PNG ----------
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
const trozo = (tipo, datos) => {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length)
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(cuerpo))
  return Buffer.concat([largo, cuerpo, crc])
}
function escribirPng(archivo, lado, pixeles) {
  const crudo = Buffer.alloc(lado * (lado * 4 + 1))
  for (let y = 0; y < lado; y++) {
    crudo[y * (lado * 4 + 1)] = 0
    pixeles.copy(crudo, y * (lado * 4 + 1) + 1, y * lado * 4, (y + 1) * lado * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(lado, 0)
  ihdr.writeUInt32BE(lado, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  fs.writeFileSync(
    archivo,
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      trozo('IHDR', ihdr),
      trozo('IDAT', zlib.deflateSync(crudo, { level: 9 })),
      trozo('IEND', Buffer.alloc(0)),
    ]),
  )
}

// ---------- Recortar ----------
// `soloMorado` deja únicamente las tres figuras: en el ícono del celular (48 px)
// el texto "RED DE APOYO A EMPRENDIMIENTOS" no se leería y ensucia el dibujo.
function recorte({ ancho, alto, pixeles }, soloMorado = false) {
  let x0 = ancho
  let y0 = alto
  let x1 = 0
  let y1 = 0
  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const o = (y * ancho + x) * 4
      const [R, G, B] = [pixeles[o], pixeles[o + 1], pixeles[o + 2]]
      const claro = R > 240 && G > 240 && B > 240
      const morado = B > R + 25 && R > G + 20 && B > 90
      const cuenta = soloMorado ? morado : !claro
      if (cuenta && pixeles[o + 3] > 20) {
        if (x < x0) x0 = x
        if (y < y0) y0 = y
        if (x > x1) x1 = x
        if (y > y1) y1 = y
      }
    }
  }
  return { x0, y0, ancho: x1 - x0 + 1, alto: y1 - y0 + 1 }
}

// ---------- Armar el ícono ----------
const logo = leerPng(ORIGEN)
const completo = recorte(logo)
const figuras = recorte(logo, true)

// La bajada "RED DE APOYO A EMPRENDIMIENTOS" no se lee en un ícono de 48 px:
// se corta buscando la última franja de tinta, que es justamente esa línea chica.
function sinLaBajada() {
  const conTinta = []
  for (let y = completo.y0; y < completo.y0 + completo.alto; y++) {
    let cuantos = 0
    for (let x = completo.x0; x < completo.x0 + completo.ancho; x++) {
      const o = (y * logo.ancho + x) * 4
      // El PNG trae el fondo transparente: sin mirar el alfa, "tinta" sería toda la imagen.
      const opaco = logo.pixeles[o + 3] > 20
      const oscuro = logo.pixeles[o] < 200 || logo.pixeles[o + 1] < 200 || logo.pixeles[o + 2] < 200
      if (opaco && oscuro) cuantos++
    }
    conTinta.push(cuantos > 4) // pocos píxeles sueltos son ruido del archivo, no una línea
  }
  const franjas = []
  conTinta.forEach((tinta, i) => {
    const ultima = franjas[franjas.length - 1]
    if (tinta && ultima && i - ultima.fin <= 8) ultima.fin = i
    else if (tinta) franjas.push({ ini: i, fin: i })
  })
  const bajada = franjas[franjas.length - 1]
  const alta = Math.max(...franjas.map((f) => f.fin - f.ini))
  if (franjas.length > 1 && bajada.fin - bajada.ini < alta * 0.4) return completo.y0 + bajada.ini - 6
  return completo.y0 + completo.alto
}

const finY = sinLaBajada()
const r = { x0: completo.x0, y0: figuras.y0 - 6, ancho: completo.ancho, alto: finY - (figuras.y0 - 6) }
console.log(`logo ${logo.ancho}×${logo.alto} · lockup ${completo.ancho}×${completo.alto} · ícono ${r.ancho}×${r.alto} desde (${r.x0}, ${r.y0})`)

function icono(lado, margen = 0.12) {
  const destino = Buffer.alloc(lado * lado * 4)
  for (let i = 0; i < lado * lado; i++) {
    destino[i * 4] = FONDO[0]
    destino[i * 4 + 1] = FONDO[1]
    destino[i * 4 + 2] = FONDO[2]
    destino[i * 4 + 3] = 255
  }
  const util = lado * (1 - margen * 2)
  const escala = Math.min(util / r.ancho, util / r.alto)
  const dibujoAncho = Math.round(r.ancho * escala)
  const dibujoAlto = Math.round(r.alto * escala)
  const izq = Math.round((lado - dibujoAncho) / 2)
  const arriba = Math.round((lado - dibujoAlto) / 2)

  for (let y = 0; y < dibujoAlto; y++) {
    for (let x = 0; x < dibujoAncho; x++) {
      // Promedio del área original que cae en este píxel: evita el dentado.
      const cx0 = Math.floor((x / dibujoAncho) * r.ancho)
      const cy0 = Math.floor((y / dibujoAlto) * r.alto)
      const sx0 = r.x0 + cx0
      const sx1 = r.x0 + Math.max(cx0 + 1, Math.floor(((x + 1) / dibujoAncho) * r.ancho))
      const sy0 = r.y0 + cy0
      const sy1 = r.y0 + Math.max(cy0 + 1, Math.floor(((y + 1) / dibujoAlto) * r.alto))
      let sr = 0
      let sg = 0
      let sb = 0
      let n = 0
      for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
          const o = (sy * logo.ancho + sx) * 4
          const a = logo.pixeles[o + 3] / 255
          sr += logo.pixeles[o] * a + FONDO[0] * (1 - a)
          sg += logo.pixeles[o + 1] * a + FONDO[1] * (1 - a)
          sb += logo.pixeles[o + 2] * a + FONDO[2] * (1 - a)
          n++
        }
      }
      const o = ((arriba + y) * lado + (izq + x)) * 4
      destino[o] = Math.round(sr / n)
      destino[o + 1] = Math.round(sg / n)
      destino[o + 2] = Math.round(sb / n)
      destino[o + 3] = 255
    }
  }
  return destino
}

const guardar = (archivo, lado, margen) => {
  escribirPng(archivo, lado, icono(lado, margen))
  console.log(`${archivo}: ${Math.round(fs.statSync(archivo).size / 1024)} KB`)
}

for (const lado of [180, 192, 512]) guardar(`public/icono-${lado}.png`, lado, 0.08)
// Android recorta los bordes del ícono "maskable" (puede quedar en círculo): margen de sobra.
guardar('public/icono-maskable-512.png', 512, 0.2)
