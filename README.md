# ESCALA

Recorrido guiado en el celular para armar presupuesto, precio, meta de ventas y flujo de caja. Ver [PROYECTO.md](PROYECTO.md).

```bash
npm install
npm run dev      # abre en la red local: prueba desde tu celular con la IP que muestra
npm test         # pruebas de los cálculos
npm run build    # genera dist/ para Vercel
```

## Dónde cambiar cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Fórmula del precio, meses del flujo, redondeo, % rápidos | `src/config.js` |
| Listas, precios de ejemplo y textos de cada oficio, o agregar un oficio | `src/data/rubros.js` |
| Cálculos | `src/lib/calc.js` (con pruebas en `calc.test.js`) |
| Textos y orden de las pantallas | `src/pantallas.jsx`, `src/estado.js` |
| Colores y tamaños | `src/estilos.css` |

## Publicar en Vercel

Importar el repositorio en vercel.com: detecta Vite solo (build `npm run build`, salida `dist`). No necesita variables de entorno.
