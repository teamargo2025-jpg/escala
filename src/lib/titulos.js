// Título de la pestaña del navegador según dónde está la persona.
import { APARTADO } from './apartados.js'

const SUELTOS = {
  '': 'ESCALA · Las cuentas de tu negocio',
  entrar: 'Entrar',
  crear: 'Crear mi cuenta',
  perfil: 'Mi cuenta',
  asesores: 'Hablar con un asesor',
  negocio: 'Tu negocio día a día',
  legal: 'Información legal',
  escalemos: 'Escalemos',
}

export function tituloDe(ruta) {
  const [seccion, sub] = ruta
  if (seccion === 'legal') return `${sub === 'terminos' ? 'Términos y condiciones' : 'Política de privacidad'} · ESCALA`
  const nombre = APARTADO[seccion]?.nombre ?? SUELTOS[seccion ?? '']
  return seccion ? `${nombre ?? 'ESCALA'} · ESCALA` : SUELTOS['']
}
