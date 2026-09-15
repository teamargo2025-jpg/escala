// Ejemplos de inventario y fichas de costo por oficio. Precios de referencia en soles:
// PENDIENTE de revisar con alguien de cada oficio, igual que rubros.js.
// costo = precio de UNA medida (1 metro, 1 litro, 1 unidad...). En las fichas, `usa` es cuánto de esa medida lleva un producto.

export const EJEMPLOS_INVENTARIO = {
  costura: {
    valorHora: 6,
    materiales: [
      { clave: 'tela', nombre: 'Tela jersey', medida: 'metros', costo: 8, minimo: 5, ayuda: 'Si compras por kilo, cambia la medida a kilos.' },
      { clave: 'hilo', nombre: 'Hilo', medida: 'conos', costo: 5, minimo: 1, ayuda: 'Un cono alcanza para unas 20 prendas.' },
      { clave: 'etiqueta', nombre: 'Etiquetas', medida: 'unidades', costo: 0.3, minimo: 20 },
      { clave: 'bolsa', nombre: 'Bolsas', medida: 'unidades', costo: 0.5, minimo: 20 },
      { clave: 'botones', nombre: 'Botones', medida: 'unidades', costo: 0.2, minimo: 30 },
      { clave: 'cierre', nombre: 'Cierres', medida: 'unidades', costo: 1.5, minimo: 10 },
      { clave: 'elastico', nombre: 'Elástico', medida: 'metros', costo: 1, minimo: 5 },
    ],
    productos: [
      { nombre: 'Polo básico', horas: 0.5, usa: { tela: 0.8, hilo: 0.05, etiqueta: 1, bolsa: 1 } },
      { nombre: 'Short con elástico', horas: 0.6, usa: { tela: 0.7, hilo: 0.05, elastico: 0.8, etiqueta: 1, bolsa: 1 } },
    ],
  },
  soldadura: {
    valorHora: 8,
    materiales: [
      { clave: 'tubo', nombre: 'Tubo cuadrado 1"', medida: 'barras', costo: 45, minimo: 3, ayuda: 'Barra de 6 metros.' },
      { clave: 'platina', nombre: 'Platina', medida: 'barras', costo: 30, minimo: 2 },
      { clave: 'electrodo', nombre: 'Electrodos', medida: 'kilos', costo: 15, minimo: 1 },
      { clave: 'disco', nombre: 'Discos de corte', medida: 'unidades', costo: 6, minimo: 3 },
      { clave: 'pintura', nombre: 'Pintura anticorrosiva', medida: 'galones', costo: 60, minimo: 1 },
      { clave: 'thinner', nombre: 'Thinner', medida: 'litros', costo: 10, minimo: 1 },
    ],
    productos: [
      { nombre: 'Reja de ventana 1×1 m', horas: 6, usa: { tubo: 3, platina: 1, electrodo: 0.5, disco: 1, pintura: 0.25, thinner: 0.5 } },
      { nombre: 'Puerta de fierro', horas: 14, usa: { tubo: 6, platina: 3, electrodo: 1.5, disco: 3, pintura: 0.5, thinner: 1 } },
    ],
  },
  estilismo: {
    valorHora: 7,
    materiales: [
      { clave: 'shampoo', nombre: 'Shampoo', medida: 'litros', costo: 25, minimo: 1, ayuda: 'En un lavado se usan unos 20 ml: 0.02 litros.' },
      { clave: 'acondicionador', nombre: 'Acondicionador', medida: 'litros', costo: 25, minimo: 1 },
      { clave: 'tinte', nombre: 'Tinte', medida: 'tubos', costo: 18, minimo: 3 },
      { clave: 'oxidante', nombre: 'Oxidante', medida: 'litros', costo: 20, minimo: 1 },
      { clave: 'navaja', nombre: 'Navajas descartables', medida: 'unidades', costo: 0.5, minimo: 20 },
      { clave: 'crema', nombre: 'Crema para peinar', medida: 'kilos', costo: 30, minimo: 1 },
    ],
    productos: [
      { nombre: 'Corte con lavado', horas: 0.75, usa: { shampoo: 0.02, acondicionador: 0.015, navaja: 1, crema: 0.01 } },
      { nombre: 'Tinte completo', horas: 2, usa: { tinte: 1, oxidante: 0.06, shampoo: 0.03, acondicionador: 0.03 } },
    ],
  },
}
