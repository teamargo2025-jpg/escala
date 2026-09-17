// Sugerencias y ejemplos por oficio. Precios de referencia en soles:
// PENDIENTE de revisar con alguien de cada oficio (PROYECTO.md, fase 3).
// Agregar un rubro = agregar un objeto aquí; no hace falta tocar pantallas.

export const RUBROS = {
  costura: {
    id: 'costura',
    nombre: 'Costura y confección',
    emoji: '🧵',
    unidad: 'prenda',
    un: 'una',
    cuantas: 'Cuántas',
    las: 'las',
    unidades: 'prendas',
    ejemploUnidad: 'un polo básico',
    ejemploCantidad: 120,
    ejemploCalculo: '5 prendas al día × 24 días = 120 prendas al mes.',
    ejemploGananciaMes: 1200,
    arranque: [
      { nombre: 'Máquina de coser recta', precio: 1200, ayuda: 'Una recta industrial usada cuesta menos. Si ya tienes una, no la marques.' },
      { nombre: 'Remalladora', precio: 1100, ayuda: 'Para acabados de polos y buzos.' },
      { nombre: 'Tijeras de sastre', precio: 45 },
      { nombre: 'Cinta métrica, reglas y tizas', precio: 30 },
      { nombre: 'Plancha', precio: 90 },
      { nombre: 'Mesa de corte', precio: 250 },
      { nombre: 'Tela e insumos para empezar', precio: 400, ayuda: 'Lo que compras la primera vez para tener con qué trabajar.' },
      { nombre: 'Maniquí', precio: 120 },
    ],
    fijos: [
      { nombre: 'Alquiler del local', precio: 350, ayuda: 'Si trabajas en tu casa y no pagas alquiler, no lo marques.' },
      { nombre: 'Luz', precio: 60, ayuda: 'Lo que pagas al mes. Si es la luz de tu casa, pon solo la parte del taller.' },
      { nombre: 'Celular e internet', precio: 50 },
      { nombre: 'Pasajes para comprar insumos', precio: 40 },
      { nombre: 'Mantenimiento de máquinas', precio: 20, ayuda: 'Aceite, agujas, arreglos. Divide lo del año entre 12.' },
    ],
    variables: [
      { nombre: 'Tela', precio: 8, ayuda: 'Solo la tela que usas en una prenda, no el rollo entero.' },
      { nombre: 'Hilo', precio: 0.5 },
      { nombre: 'Botones, cierres o elástico', precio: 1 },
      { nombre: 'Etiqueta y bolsa', precio: 0.8 },
      { nombre: 'Pago a ayudante por prenda', precio: 3, ayuda: 'Solo si le pagas a alguien por cada prenda que hace.' },
    ],
  },

  soldadura: {
    id: 'soldadura',
    nombre: 'Soldadura y mecánica',
    emoji: '🔧',
    unidad: 'trabajo',
    un: 'un',
    cuantas: 'Cuántos',
    las: 'los',
    unidades: 'trabajos',
    ejemploUnidad: 'una reja de ventana',
    ejemploCantidad: 10,
    ejemploCalculo: '2 o 3 trabajos por semana × 4 semanas = unos 10 trabajos al mes.',
    ejemploGananciaMes: 1500,
    arranque: [
      { nombre: 'Máquina de soldar', precio: 700 },
      { nombre: 'Amoladora', precio: 250 },
      { nombre: 'Taladro', precio: 220 },
      { nombre: 'Careta, guantes y mandil', precio: 150, ayuda: 'Tu seguridad también es parte de lo que necesitas para arrancar.' },
      { nombre: 'Tornillo de banco y mesa', precio: 300 },
      { nombre: 'Herramientas de mano', precio: 200, ayuda: 'Llaves, alicates, martillo, escuadra, wincha.' },
      { nombre: 'Extensión eléctrica', precio: 60 },
    ],
    fijos: [
      { nombre: 'Alquiler del taller', precio: 500, ayuda: 'Si trabajas en tu casa y no pagas alquiler, no lo marques.' },
      { nombre: 'Luz', precio: 150, ayuda: 'La soldadora gasta bastante luz. Mira tu recibo.' },
      { nombre: 'Celular', precio: 40 },
      { nombre: 'Movilidad', precio: 80 },
      { nombre: 'Mantenimiento de herramientas', precio: 30 },
    ],
    variables: [
      { nombre: 'Fierro o tubos', precio: 120, ayuda: 'El material de un trabajo como el de tu ejemplo.' },
      { nombre: 'Soldadura (electrodos)', precio: 15 },
      { nombre: 'Discos de corte y desbaste', precio: 12 },
      { nombre: 'Pintura anticorrosiva y thinner', precio: 25 },
      { nombre: 'Transporte del material', precio: 15 },
    ],
  },

  estilismo: {
    id: 'estilismo',
    nombre: 'Estilismo y peluquería',
    emoji: '✂️',
    unidad: 'servicio',
    un: 'un',
    cuantas: 'Cuántos',
    las: 'los',
    unidades: 'servicios',
    ejemploUnidad: 'un corte con lavado',
    ejemploCantidad: 150,
    ejemploCalculo: '6 servicios al día × 25 días = 150 servicios al mes.',
    ejemploGananciaMes: 1200,
    arranque: [
      { nombre: 'Sillón de peluquería', precio: 450 },
      { nombre: 'Espejo grande', precio: 150 },
      { nombre: 'Lavacabezas', precio: 500 },
      { nombre: 'Secadora de cabello', precio: 120 },
      { nombre: 'Plancha de cabello', precio: 130 },
      { nombre: 'Máquina de cortar', precio: 150 },
      { nombre: 'Tijeras y peines', precio: 80 },
      { nombre: 'Capas y toallas', precio: 60 },
      { nombre: 'Productos para empezar', precio: 300, ayuda: 'Shampoo, tintes, cremas: lo que compras la primera vez.' },
    ],
    fijos: [
      { nombre: 'Alquiler del local', precio: 400, ayuda: 'Si atiendes en tu casa y no pagas alquiler, no lo marques.' },
      { nombre: 'Luz y agua', precio: 90 },
      { nombre: 'Celular e internet', precio: 50 },
      { nombre: 'Publicidad en redes', precio: 30 },
      { nombre: 'Afilado y mantenimiento', precio: 20 },
    ],
    variables: [
      { nombre: 'Shampoo y acondicionador', precio: 1.5, ayuda: 'Lo que gastas en un solo servicio, no el frasco entero.' },
      { nombre: 'Crema, gel o laca', precio: 1 },
      { nombre: 'Lavado de toalla', precio: 0.5 },
      { nombre: 'Navaja o cuchilla descartable', precio: 0.5 },
    ],
  },
}

export const LISTA_RUBROS = Object.values(RUBROS)

// Para oficios que no están en la lista: sugerencias generales, sin nombres de un rubro concreto.
export const GENERICO = {
  arranque: [
    { nombre: 'Herramientas de trabajo', precio: 300 },
    { nombre: 'Máquina o equipo', precio: 800 },
    { nombre: 'Mesa o mueble de trabajo', precio: 250 },
    { nombre: 'Materiales para empezar', precio: 400, ayuda: 'Lo que compras la primera vez para tener con qué trabajar.' },
    { nombre: 'Utensilios pequeños', precio: 100 },
    { nombre: 'Letrero o publicidad para empezar', precio: 80 },
  ],
  fijos: [
    { nombre: 'Alquiler del local', precio: 350, ayuda: 'Si trabajas en tu casa y no pagas alquiler, no lo marques.' },
    { nombre: 'Luz', precio: 60 },
    { nombre: 'Agua', precio: 30 },
    { nombre: 'Celular e internet', precio: 50 },
    { nombre: 'Movilidad y pasajes', precio: 60 },
    { nombre: 'Mantenimiento de herramientas', precio: 20 },
  ],
  variables: [
    { nombre: 'Material principal', precio: 10, ayuda: 'Lo que más usas para hacer uno.' },
    { nombre: 'Otros materiales', precio: 3 },
    { nombre: 'Empaque o bolsa', precio: 1 },
    { nombre: 'Transporte de la entrega', precio: 2 },
  ],
}

export const EMOJIS_RUBRO = ['🧰', '🪵', '🍰', '🍽️', '🚚', '💻', '🌻', '🧹', '💄', '🐔', '👟', '🎨', '📸', '🔌']

// Arma un rubro con lo que la persona escribió. el campo genero decide si se dice "un" o "una".
export function crearRubro({ nombre, unidad, unidades, genero = 'm', emoji = '🧰' }) {
  const femenino = genero === 'f'
  const sing = unidad.trim().toLowerCase()
  const plural = (unidades || '').trim().toLowerCase() || (/[aeiouáéíóú]$/.test(sing) ? `${sing}s` : `${sing}es`)
  return {
    id: 'otro',
    propio: true,
    nombre: nombre.trim(),
    emoji,
    genero,
    unidad: sing,
    unidades: plural,
    un: femenino ? 'una' : 'un',
    cuantas: femenino ? 'Cuántas' : 'Cuántos',
    las: femenino ? 'las' : 'los',
    ejemploUnidad: `${femenino ? 'una' : 'un'} ${sing}`,
    ejemploCantidad: 40,
    ejemploCalculo: `si haces 2 ${plural} al día y trabajas 20 días, son 40 ${plural} al mes.`,
    ejemploGananciaMes: 1200,
    ...GENERICO,
  }
}

// El rubro de una persona: uno de los tres, o el que ella misma creó.
export const rubroDe = (perfil) => RUBROS[perfil?.rubro] ?? perfil?.datos?.rubroPersonalizado ?? RUBROS.costura
