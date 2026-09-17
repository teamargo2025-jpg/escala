// Personas a las que un participante puede escribir si se traba.
// Los números van en formato internacional sin el +: Perú es 51 + 9 dígitos.
export const ASESORES = [
  {
    id: 'facilitador',
    nombre: 'Asesor ESCALA',
    rol: 'Facilitador de la capacitación',
    detalle: 'Dudas de la app, de tus números o de la sesión.',
    telefono: '51916468701',
    horario: 'Lunes a sábado, de 9 a 6',
    emoji: '🎓',
  },
]

export const enlaceWhatsapp = (asesor, texto) =>
  `https://wa.me/${asesor.telefono}?text=${encodeURIComponent(texto)}`
