// Decisiones pendientes de confirmar contra la PPT (ver PROYECTO.md, "Preguntas abiertas").
// Cambiar aquí cambia toda la app.

// 'sobre_costo':  precio = costo × (1 + %)      ← método "tradicional" asumido
// 'sobre_precio': precio = costo ÷ (1 − %)      ← el % es parte del precio final
export const METODO_PRECIO = 'sobre_costo'

// Cuántos meses muestra el flujo de caja.
export const MESES_FLUJO = 5

// El precio sugerido se redondea hacia arriba a este múltiplo (en soles). 0 = sin redondeo.
export const REDONDEO_PRECIO = 0.5

// Opciones rápidas de % de ganancia en la pantalla de precio.
export const GANANCIAS_RAPIDAS = [20, 30, 40, 50]
export const GANANCIA_INICIAL = 30

export const CLAVE_GUARDADO = 'escala:v1'

// Dominio interno para convertir el apodo en "correo" de Supabase Auth. Nunca se envían correos;
// .invalid es un dominio reservado que no existe, así nadie recibe nada por error.
export const DOMINIO_CUENTAS = 'cuentas.escala.invalid'

// Cuántos emprendimientos puede llevar una misma cuenta. Con más de dos, los
// números de cada uno se mezclan en la cabeza de la persona y deja de ayudar.
export const MAX_NEGOCIOS = 2

// Secciones que todavía no se muestran: la pestaña sigue en la barra, pero adentro
// aparece la pantalla de "en obra". Para abrir una, sácala de esta lista.
export const EN_OBRAS = ['marca', 'escalemos']

// EcoEscala muestra el aviso de "empieza a juntar" en vez de los puntos y premios.
export const ECO_PRONTO = true
