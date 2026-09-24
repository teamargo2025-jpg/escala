// Contenidos de apoyo para el apartado de marca.

// Personalidad: cómo quiere que la gente sienta su marca.
export const PALABRAS_MARCA = [
  'Confiable', 'Puntual', 'Económica', 'Elegante', 'Moderna', 'Tradicional', 'Divertida', 'Cercana',
  'Rápida', 'Artesanal', 'Juvenil', 'Familiar', 'Detallista', 'Resistente', 'Limpia', 'Creativa',
]

// Ideas de publicación. Las generales sirven para cualquier oficio.
export const IDEAS_GENERALES = [
  'Antes y después de un trabajo',
  'Cómo lo hago: video corto del proceso',
  'Presentación: quién soy y qué hago',
  'Lo que dicen mis clientes (testimonio)',
  'Precios y formas de pago',
  'Un día de trabajo (detrás de cámara)',
  'Responder la pregunta que más me hacen',
  'Mostrar mis materiales y por qué los elijo',
]

export const IDEAS_POR_RUBRO = {
  costura: ['Cómo tomo medidas', 'Telas: cuál aguanta más lavadas', 'Arreglos que salvan una prenda', 'Prendas listas de esta semana'],
  soldadura: ['Trabajo terminado e instalado', 'Cómo mido y corto el fierro', 'Seguridad en el taller', 'Rejas y puertas que hice este mes'],
  estilismo: ['Cambio de look en 30 segundos', 'Cuidado del cabello en casa', 'Tintes: antes y después', 'Peinados para eventos'],
}

export const ESTADOS_CONTENIDO = {
  pendiente: { nombre: 'Por grabar', emoji: '🎬', color: '#b7730c' },
  grabado: { nombre: 'Grabado', emoji: '📼', color: '#2f6fdb' },
  publicado: { nombre: 'Publicado', emoji: '✅', color: '#1f8a5b' },
}

// La foto se guarda dentro del negocio, así que se comprime fuerte antes.
export const FOTO = { lado: 320, calidad: 0.72 }
