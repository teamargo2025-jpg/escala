// EcoEscala: puntos por material, premios y qué se puede hacer con lo que sobra.
// Los puntos se calculan aquí, no en la base: así se ajustan sin tocar los datos ya registrados.

export const MATERIALES = {
  plastico: { nombre: 'Plástico', emoji: '🧴', puntosPorKilo: 10, color: '#2f6fdb' },
  carton: { nombre: 'Cartón y papel', emoji: '📦', puntosPorKilo: 5, color: '#9a6417' },
  vidrio: { nombre: 'Vidrio', emoji: '🫙', puntosPorKilo: 4, color: '#0e8a8a' },
  metal: { nombre: 'Metal', emoji: '🔩', puntosPorKilo: 12, color: '#5b4bd6' },
  tela: { nombre: 'Tela y retazos', emoji: '🧵', puntosPorKilo: 8, color: '#c2366f' },
}

export const puntosDe = (material, kilos) => Math.round((MATERIALES[material]?.puntosPorKilo ?? 0) * Number(kilos || 0))

export const puntosTotales = (entregas = []) => entregas.reduce((s, e) => s + puntosDe(e.material, e.kilos), 0)

// Premios: cosas que ESCALA ya produce, así que entregarlas casi no cuesta.
export const PREMIOS = [
  { id: 'asesoria', nombre: 'Asesoría de 30 minutos', detalle: 'Una sesión para revisar tus números o tu negocio con un asesor.', puntos: 100, emoji: '🧑‍🏫' },
  { id: 'diseno', nombre: 'Diseño para tus redes', detalle: 'Tres publicaciones diseñadas con tu marca, listas para publicar.', puntos: 150, emoji: '🎨' },
  { id: 'taller', nombre: 'Taller de transformación', detalle: 'Cupo en el taller "qué hacer con tus retazos y sobrantes".', puntos: 200, emoji: '♻️' },
  { id: 'mencion', nombre: 'Mención en la revista', detalle: 'Tu emprendimiento nombrado en la próxima edición.', puntos: 300, emoji: '📰' },
  { id: 'destacado', nombre: 'Destacado en Escalemos', detalle: 'Tu publicación aparece primera durante un mes.', puntos: 400, emoji: '⭐' },
]

// "El residuo de uno es el material gratis de otro": ideas para el tablero de sobrantes.
export const IDEAS_APROVECHAR = [
  { de: 'Retazos de tela', para: 'Manualidades, tapicería', usos: 'Cojines, muñecas, alfombras trenzadas, scrunchies' },
  { de: 'Retazos grandes de tela', para: 'Talleres mecánicos', usos: 'Trapo industrial, que hoy se compra' },
  { de: 'Recortes de fierro', para: 'Soldadura y decoración', usos: 'Soportes, adornos, rejillas pequeñas' },
  { de: 'Aserrín y viruta', para: 'Mascotas y jardinería', usos: 'Camas de mascota, compost' },
  { de: 'Cajas de cartón', para: 'Todos los rubros', usos: 'Empaque para despachos, moldes de patronaje' },
  { de: 'Botellas y envases', para: 'Manualidades y viveros', usos: 'Maceteros, organizadores' },
  { de: 'Cabello cortado', para: 'Jardinería y limpieza', usos: 'Compost, absorbentes de aceite' },
]

export const TIPOS_OPORTUNIDAD = {
  feria: { nombre: 'Feria', emoji: '🎪', color: '#c2366f' },
  pedido: { nombre: 'Pedido grande', emoji: '📦', color: '#b7730c' },
  credito: { nombre: 'Crédito', emoji: '🏦', color: '#2f6fdb' },
  taller: { nombre: 'Taller', emoji: '🎓', color: '#9b34c9' },
  revista: { nombre: 'Revista', emoji: '📰', color: '#0e8a8a' },
  convocatoria: { nombre: 'Convocatoria', emoji: '📣', color: '#5b4bd6' },
}
