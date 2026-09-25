// Cuenta anónima de uso, solo para saber dónde se traba la gente durante el piloto.
// No guarda nombres, ni DNI, ni números del negocio: un identificador al azar del celular y el nombre del evento.
import { almacen, nuevoId } from '../almacen.js'

const CLAVE = 'escala:anon'

function celularAnonimo() {
  try {
    let id = localStorage.getItem(CLAVE)
    if (!id) {
      id = nuevoId()
      localStorage.setItem(CLAVE, id)
    }
    return id
  } catch {
    return 'sin-almacenamiento'
  }
}

// Nunca interrumpe a la persona: si falla, se pierde el dato y ya.
export function registrar(evento, rubro) {
  try {
    almacen.registrarEvento?.({ sesion: celularAnonimo(), evento, rubro: rubro ?? null })
  } catch {
    // sin conexión o sin permisos: no pasa nada
  }
}
