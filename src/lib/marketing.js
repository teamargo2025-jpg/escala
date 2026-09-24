// Fechas que mueven las ventas en Perú, para planificar con tiempo el contenido.
import { hoy } from './caja.js'

const domingoNumero = (anio, mes, n) => {
  const primero = new Date(anio, mes - 1, 1)
  const primerDomingo = 1 + ((7 - primero.getDay()) % 7)
  return new Date(anio, mes - 1, primerDomingo + (n - 1) * 7)
}

// Viernes siguiente al cuarto jueves de noviembre.
const blackFriday = (anio) => {
  const primero = new Date(anio, 10, 1)
  const primerJueves = 1 + ((4 - primero.getDay() + 7) % 7)
  return new Date(anio, 10, primerJueves + 21 + 1)
}

const fija = (mes, dia) => (anio) => new Date(anio, mes - 1, dia)

export const FECHAS_CLAVE = [
  { id: 'año-nuevo', nombre: 'Año Nuevo', emoji: '🎆', cuando: fija(1, 1), idea: () => 'Promoción de arranque de año y metas: "empieza el año con…".' },
  { id: 'vuelta-clases', nombre: 'Regreso a clases', emoji: '🎒', cuando: fija(3, 1), idea: () => 'Todo lo que las familias compran en marzo: uniformes, arreglos, cortes de cabello.' },
  { id: 'san-valentin', nombre: 'San Valentín', emoji: '💝', cuando: fija(2, 14), idea: (r) => `Arma un combo de regalo con tus ${r.unidades} y muestra cómo lo entregas.` },
  { id: 'dia-mujer', nombre: 'Día de la Mujer', emoji: '💜', cuando: fija(3, 8), idea: () => 'Cuenta tu historia de emprendedora o la de tus clientas.' },
  { id: 'dia-trabajo', nombre: 'Día del Trabajo', emoji: '🛠️', cuando: fija(5, 1), idea: () => 'Muestra tu oficio y tus manos trabajando: la gente valora el trabajo bien hecho.' },
  { id: 'dia-madre', nombre: 'Día de la Madre', emoji: '💐', cuando: (a) => domingoNumero(a, 5, 2), idea: (r) => `La fecha más fuerte del año: ofrece un regalo para mamá con tus ${r.unidades} y empieza a publicar 3 semanas antes.` },
  { id: 'dia-padre', nombre: 'Día del Padre', emoji: '👔', cuando: (a) => domingoNumero(a, 6, 3), idea: (r) => `Regalos para papá: muestra tus ${r.unidades} más pedidas por varones.` },
  { id: 'dia-maestro', nombre: 'Día del Maestro', emoji: '🍎', cuando: fija(7, 6), idea: () => 'Detalles para profesores y descuento para docentes.' },
  { id: 'fiestas-patrias', nombre: 'Fiestas Patrias', emoji: '🇵🇪', cuando: fija(7, 28), idea: (r) => `Edición patria: ${r.unidades} en rojo y blanco, y ofertas por el mes patrio.` },
  { id: 'dia-nino', nombre: 'Día del Niño', emoji: '🧒', cuando: (a) => domingoNumero(a, 8, 3), idea: () => 'Productos y servicios para los más chicos, o descuento por venir en familia.' },
  { id: 'santa-rosa', nombre: 'Santa Rosa de Lima', emoji: '🌹', cuando: fija(8, 30), idea: () => 'Feriado largo: publica con anticipación tus horarios de atención.' },
  { id: 'cancion-criolla', nombre: 'Halloween y Canción Criolla', emoji: '🎃', cuando: fija(10, 31), idea: () => 'Disfraces, decoración o edición criolla de lo que vendes.' },
  { id: 'black-friday', nombre: 'Black Friday', emoji: '🏷️', cuando: blackFriday, idea: () => 'Una sola oferta clara y con fecha de fin. Avisa 3 días antes.' },
  { id: 'navidad', nombre: 'Navidad', emoji: '🎄', cuando: fija(12, 25), idea: (r) => `Regalos y canastas: prepara tus ${r.unidades} para pedidos desde noviembre.` },
]

const aTexto = (f) => `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export const fechaBonita = (texto) => {
  const [a, m, d] = texto.split('-').map(Number)
  return `${d} de ${MESES[m - 1]}${a !== new Date().getFullYear() ? ` de ${a}` : ''}`
}

export const diasHasta = (fecha, desde = hoy()) => {
  const [a1, m1, d1] = desde.split('-').map(Number)
  const [a2, m2, d2] = fecha.split('-').map(Number)
  return Math.round((new Date(a2, m2 - 1, d2) - new Date(a1, m1 - 1, d1)) / 86400000)
}

// Las próximas fechas, incluyendo las del año siguiente cuando ya pasaron.
export function proximasFechas(desde = hoy(), cantidad = 6) {
  const anio = Number(desde.slice(0, 4))
  return FECHAS_CLAVE.flatMap((f) => [anio, anio + 1].map((a) => ({ ...f, fecha: aTexto(f.cuando(a)) })))
    .map((f) => ({ ...f, dias: diasHasta(f.fecha, desde) }))
    .filter((f) => f.dias >= 0)
    .sort((a, b) => a.dias - b.dias)
    .filter((f, i, lista) => lista.findIndex((x) => x.id === f.id) === i)
    .slice(0, cantidad)
}

// Se graba con anticipación: por defecto, dos semanas antes de la fecha.
export function fechaDeGrabacion(fecha, desde = hoy(), diasAntes = 14) {
  const [a, m, d] = fecha.split('-').map(Number)
  const propuesta = new Date(a, m - 1, d - diasAntes)
  return aTexto(propuesta) < desde ? desde : aTexto(propuesta)
}
