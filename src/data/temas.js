// Colores de la app. Cada persona elige el suyo desde Mi cuenta; se guarda con su negocio.
// Para agregar uno: copia un bloque y cambia los tonos. Los oscuros llevan texto blanco encima,
// así que deben ser oscuros de verdad.

export const TEMAS = [
  {
    id: 'morado',
    nombre: 'Morado',
    muestra: '#6d28d9',
    vars: {
      '--marca': '#6d28d9', '--marca-oscura': '#4c1d95', '--tinta': '#26124f', '--tinta-2': '#4f4270', '--tinta-3': '#7f7699',
      '--acento': '#c4a5ff', '--acento-oscuro': '#9d74f0', '--acento-claro': '#efe6ff',
      '--sobre-oscuro': '#d8ccf2', '--sobre-oscuro-2': '#bba9e0',
      '--fondo': '#f5f2fa', '--papel': '#fdfcff', '--linea': '#e3dcef', '--pista': '#ece6f5', '--desactivado': '#c9c1d9',
      '--superficie-marca': 'linear-gradient(160deg, #5b21b6 0%, #3b0f7a 100%)',
    },
  },
  {
    id: 'verde',
    nombre: 'Verde',
    muestra: '#15803d',
    vars: {
      '--marca': '#15803d', '--marca-oscura': '#14532d', '--tinta': '#10301f', '--tinta-2': '#3c5a48', '--tinta-3': '#6d8a79',
      '--acento': '#86efac', '--acento-oscuro': '#4ade80', '--acento-claro': '#e7f8ec',
      '--sobre-oscuro': '#cfe8d8', '--sobre-oscuro-2': '#a9d0ba',
      '--fondo': '#f2f8f4', '--papel': '#fbfefc', '--linea': '#d8e8de', '--pista': '#e3efe7', '--desactivado': '#bdccc3',
      '--superficie-marca': 'linear-gradient(160deg, #166534 0%, #0b3d20 100%)',
    },
  },
  {
    id: 'azul',
    nombre: 'Azul',
    muestra: '#1d4ed8',
    vars: {
      '--marca': '#1d4ed8', '--marca-oscura': '#1e3a8a', '--tinta': '#10224f', '--tinta-2': '#41516f', '--tinta-3': '#71829f',
      '--acento': '#a7c4ff', '--acento-oscuro': '#7aa2f7', '--acento-claro': '#e6eeff',
      '--sobre-oscuro': '#cfdcf7', '--sobre-oscuro-2': '#a8c0ea',
      '--fondo': '#f2f5fc', '--papel': '#fbfcff', '--linea': '#dbe3f2', '--pista': '#e6ecf7', '--desactivado': '#c1c9da',
      '--superficie-marca': 'linear-gradient(160deg, #1e40af 0%, #132a6b 100%)',
    },
  },
  {
    id: 'turquesa',
    nombre: 'Turquesa',
    muestra: '#0f766e',
    vars: {
      '--marca': '#0f766e', '--marca-oscura': '#115e59', '--tinta': '#0b302e', '--tinta-2': '#3a5a57', '--tinta-3': '#6c8b88',
      '--acento': '#99f6e4', '--acento-oscuro': '#5eead4', '--acento-claro': '#e3f8f5',
      '--sobre-oscuro': '#c7ece7', '--sobre-oscuro-2': '#9fd5cf',
      '--fondo': '#f1f8f7', '--papel': '#fafefd', '--linea': '#d5e9e6', '--pista': '#e2f1ef', '--desactivado': '#bacecb',
      '--superficie-marca': 'linear-gradient(160deg, #0f766e 0%, #0a4741 100%)',
    },
  },
  {
    id: 'naranja',
    nombre: 'Naranja',
    muestra: '#c2410c',
    vars: {
      '--marca': '#c2410c', '--marca-oscura': '#9a3412', '--tinta': '#431407', '--tinta-2': '#6b4436', '--tinta-3': '#9a7b6d',
      '--acento': '#fdba74', '--acento-oscuro': '#fb923c', '--acento-claro': '#fff0e4',
      '--sobre-oscuro': '#fbdcc4', '--sobre-oscuro-2': '#e8bb9a',
      '--fondo': '#fcf5f0', '--papel': '#fffcfa', '--linea': '#f0e0d4', '--pista': '#f6e9df', '--desactivado': '#d9c6ba',
      '--superficie-marca': 'linear-gradient(160deg, #c2410c 0%, #7c2d12 100%)',
    },
  },
  {
    id: 'rosa',
    nombre: 'Rosa',
    muestra: '#be185d',
    vars: {
      '--marca': '#be185d', '--marca-oscura': '#9d174d', '--tinta': '#3f0725', '--tinta-2': '#6b4054', '--tinta-3': '#9b7387',
      '--acento': '#f9a8d4', '--acento-oscuro': '#f472b6', '--acento-claro': '#fdeaf3',
      '--sobre-oscuro': '#f8d2e4', '--sobre-oscuro-2': '#e5a8c6',
      '--fondo': '#fdf3f8', '--papel': '#fffbfd', '--linea': '#f2dde7', '--pista': '#f7e6ee', '--desactivado': '#d9c2cd',
      '--superficie-marca': 'linear-gradient(160deg, #be185d 0%, #831843 100%)',
    },
  },
]

export const TEMA_POR_DEFECTO = TEMAS[0].id
export const temaDe = (id) => TEMAS.find((t) => t.id === id) ?? TEMAS[0]

// Pinta el tema en la página y en la barra del navegador del celular.
export function aplicarTema(id) {
  const t = temaDe(id)
  for (const [k, v] of Object.entries(t.vars)) document.documentElement.style.setProperty(k, v)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', t.vars['--marca-oscura'])
}
