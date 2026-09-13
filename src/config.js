// Decisiones pendientes de confirmar contra la PPT (ver PROYECTO.md, "Preguntas abiertas").
// Cambiar aquí cambia toda la app.

// 'sobre_costo':  precio = costo × (1 + %)      ← método "tradicional" asumido
// 'sobre_precio': precio = costo ÷ (1 − %)      ← el % es parte del precio final
export const METODO_PRECIO = 'sobre_costo'

// Cuántos meses muestra el flujo de caja.
export const MESES_FLUJO = 3

// El precio sugerido se redondea hacia arriba a este múltiplo (en soles). 0 = sin redondeo.
export const REDONDEO_PRECIO = 0.5

// Opciones rápidas de % de ganancia en la pantalla de precio.
export const GANANCIAS_RAPIDAS = [20, 30, 40, 50]
export const GANANCIA_INICIAL = 30

export const CLAVE_GUARDADO = 'escala:v1'
