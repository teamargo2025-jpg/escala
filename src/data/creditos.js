// Ofertas de crédito que ESCALA puede mostrar.
//
// Microwd es la microfinanciera aliada de ESCALA. Sus datos los da el equipo y se
// actualizan acá cuando cambien. El comparador los pone a competir con cualquier otra
// opción que la persona traiga: si la aliada siempre ganara por diseño, la herramienta
// no serviría de nada y ESCALA perdería la confianza que le tienen.
export const OFERTAS = [
  {
    id: 'microwd-4',
    entidad: 'Microwd',
    nombre: '4 meses',
    meses: 4,
    tcea: 51.11,
    minimo: 1000,
    maximo: 1600,
    aliado: true,
  },
  {
    id: 'microwd-es-12',
    entidad: 'Microwd España',
    nombre: '12 meses',
    meses: 12,
    tcea: 45.68,
    minimo: 1000,
    maximo: null,
    aliado: true,
  },
]

// Ejemplo para enseñar, no es una oferta de nadie: así se ve el préstamo del mercado
// cuando se le saca la cuenta al año. Se muestra siempre marcado como ejemplo.
export const EJEMPLO_INFORMAL = {
  id: 'prestamista',
  entidad: 'Prestamista del mercado',
  nombre: 'Ejemplo: 10% al mes',
  tasaMes: 10,
  ejemplo: true,
}

export const PLAZOS = [3, 4, 6, 12, 18, 24]
