// Reglas de la cuenta: apodo como usuario, DNI (o carné de extranjería) como clave.
import { DOMINIO_CUENTAS } from '../config.js'

export function limpiarTexto(s) {
  return String(s ?? '').replace(/\s+/g, ' ').trim()
}

// "María José " y "maria jose" son la misma cuenta.
export function claveApodo(apodo) {
  return limpiarTexto(apodo)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export function validarApodo(apodo) {
  const limpio = limpiarTexto(apodo)
  if (claveApodo(limpio).length < 2) return 'Escribe al menos 2 letras.'
  if (limpio.length > 40) return 'Es muy largo. Usa un nombre más corto.'
  return null
}

export function validarEmprendimiento(nombre) {
  const limpio = limpiarTexto(nombre)
  if (limpio.length < 2) return 'Escribe el nombre de tu emprendimiento.'
  if (limpio.length > 60) return 'Es muy largo. Usa un nombre más corto.'
  return null
}

export function limpiarDocumento(doc) {
  return String(doc ?? '').toUpperCase().replace(/[^0-9A-Z]/g, '')
}

// DNI: 8 números. Carné de extranjería: 9 a 12 letras o números.
export function validarDocumento(doc, tipo = 'dni') {
  const d = limpiarDocumento(doc)
  if (tipo === 'dni') return /^\d{8}$/.test(d) ? null : 'El DNI tiene 8 números.'
  return /^[0-9A-Z]{9,12}$/.test(d) ? null : 'El carné tiene de 9 a 12 letras o números.'
}

export const correoDeApodo = (apodo) => `${claveApodo(apodo)}@${DOMINIO_CUENTAS}`

// El prefijo no agrega seguridad; evita que Supabase rechace la clave por "demasiado común".
export const claveDeDocumento = (doc) => `escala-${limpiarDocumento(doc)}`
