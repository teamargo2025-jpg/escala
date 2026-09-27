// Genera dist/sw.js con la lista de archivos de esta compilación.
// Se ejecuta después de `vite build`: los nombres llevan un hash que cambia en cada build,
// así que la lista se arma acá y no se escribe a mano.
import fs from 'node:fs'
import path from 'node:path'

const DIST = 'dist'

// Todo lo que hace falta para que la app abra sin señal.
function archivosDe(dir, base = '') {
  return fs.readdirSync(path.join(DIST, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = base ? `${base}/${e.name}` : e.name
    if (e.isDirectory()) return archivosDe(path.join(dir, e.name), rel)
    // El propio sw y los mapas de depuración no se guardan.
    if (e.name === 'sw.js' || e.name.endsWith('.map')) return []
    return [`/${rel}`]
  })
}

const archivos = ['/', ...archivosDe('.')]
const version = `escala-${Date.now().toString(36)}`

const sw = `// Service worker de ESCALA. Generado por scripts/generar-sw.mjs, no editar a mano.
//
// Para qué: la app se instala en el celular y tiene que abrir aunque no haya señal.
// Quien anota su caja en el mercado no siempre tiene datos, y una pantalla en blanco
// la primera vez que falla el internet es suficiente para que no la vuelva a abrir.
const CACHE = '${version}'
const ARCHIVOS = ${JSON.stringify(archivos, null, 2)}

self.addEventListener('install', (e) => {
  // Se guarda todo de una vez; si un archivo falla, igual se instala con el resto.
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(ARCHIVOS.map((a) => c.add(a)))).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  // Las tipografías de Google se guardan la primera vez: sin ellas la app se ve
  // con la letra del sistema y pierde la cara de ESCALA.
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    e.respondWith(
      caches.match(req, { ignoreVary: true }).then(
        (guardado) =>
          guardado ??
          fetch(req).then((r) => {
            const copia = r.clone()
            caches.open(CACHE).then((c) => c.put(req, copia))
            return r
          }),
      ),
    )
    return
  }

  // Supabase y cualquier otro servidor: siempre en vivo, nunca desde la copia.
  if (url.origin !== self.location.origin) return

  // Navegación: se intenta la red y, si no hay, se abre la copia guardada.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copia = r.clone()
          caches.open(CACHE).then((c) => c.put('/', copia))
          return r
        })
        // ignoreVary: el archivo guardado sirve igual aunque la petición traiga otras cabeceras.
        .catch(() => caches.match('/', { ignoreVary: true }).then((r) => r ?? caches.match('/index.html', { ignoreVary: true }))),
    )
    return
  }

  // Archivos con hash en el nombre: si ya están guardados, no hace falta pedirlos.
  // Los scripts de Vite se piden con crossorigin, así que la petición no es idéntica
  // a la que se guardó al instalar: sin ignoreVary no encontraría la copia.
  e.respondWith(
    caches.match(req, { ignoreVary: true }).then(
      (guardado) =>
        guardado ??
        fetch(req).then((r) => {
          if (r.ok) {
            const copia = r.clone()
            caches.open(CACHE).then((c) => c.put(req, copia))
          }
          return r
        }),
    ),
  )
})
`

fs.writeFileSync(path.join(DIST, 'sw.js'), sw)
console.log(`sw.js: ${archivos.length} archivos guardados para usar sin internet (${version})`)
