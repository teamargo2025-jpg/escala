// Lecciones de educación financiera: cortas, con ejemplos del oficio y, si ya existen, con los números de la persona.
// Van en orden, de lo más básico a lo más importante: cada una se abre al terminar la anterior.
// Cada tarjeta es un texto corto; **así** se marca en negrita.
// tarjetas(r, n, hechos) y pregunta(r, n) reciben el rubro y los números calculados del negocio.
import { soles } from '../lib/calc.js'

export const MODULOS = [
  { id: 'basico', nombre: 'Módulo 1 · Lo básico del dinero', color: '#1f8a5b', claro: '#dff3e8' },
  { id: 'cuidar', nombre: 'Módulo 2 · Cuida tu dinero', color: '#2f6fdb', claro: '#e0ebfd' },
  { id: 'crecer', nombre: 'Módulo 3 · Crece y formalízate', color: '#9b34c9', claro: '#f3e4fb' },
]

export const LECCIONES = [
  // ---------- Módulo 1: lo básico ----------
  {
    id: 'separar',
    modulo: 'basico',
    emoji: '👛',
    titulo: 'El dinero del negocio no es el de la casa',
    tarjetas: () => [
      'Si todo está en el mismo bolsillo, **nunca sabes si tu negocio gana o pierde**. Cuando sacas para la casa sin anotar, parece que el negocio "no da".',
      'Ten un lugar **solo para el negocio**: una cajita, un sobre o una cuenta aparte. Lo que vendes entra ahí; lo que compras para el negocio sale de ahí.',
      '**Págate un sueldo**: decide un monto fijo cada semana o cada mes y pásalo a tu casa. Así el negocio siempre tiene dinero para comprar materiales.',
    ],
    pregunta: (r) => ({
      texto: `Cobraste ${r.un} ${r.unidad} y usaste ese dinero para el almuerzo de tu familia, sin anotarlo. ¿Qué pasa?`,
      opciones: ['Nada, igual es mi dinero', 'Después no sé cuánto ganó de verdad mi negocio', 'Mi negocio gana más'],
      correcta: 1,
      porQue: 'Si el dinero sale sin anotarse, tus cuentas no cuadran y no sabes si el negocio gana. Págate un sueldo fijo y anótalo como salida.',
    }),
    accion: { texto: 'Ir a mi control de caja', ruta: '/caja' },
  },
  {
    id: 'anotar',
    modulo: 'basico',
    emoji: '📝',
    titulo: 'Lo que no se anota, se olvida',
    tarjetas: () => [
      'La memoria engaña. Al final del mes nadie recuerda todos los pasajes, bolsas y compras pequeñas. **Esos gastos chiquitos suman.**',
      '**Anota en el momento**: cuánto entró, cuánto salió y por qué. Toma un minuto.',
      'Una vez por semana **cuenta tu dinero** y compáralo con tu control de caja. Si no coincide, falta anotar algo.',
    ],
    pregunta: () => ({
      texto: '¿Cuándo es mejor anotar una venta?',
      opciones: ['Al final del mes', 'En el momento, apenas vendo', 'Solo si es una venta grande'],
      correcta: 1,
      porQue: 'Si anotas en el momento no se te olvida nada, y al final del mes tus números son reales.',
    }),
    accion: { texto: 'Anotar en mi control de caja', ruta: '/caja' },
  },
  {
    id: 'ganancia',
    modulo: 'basico',
    emoji: '📈',
    titulo: 'Vender mucho no es lo mismo que ganar',
    tarjetas: (r, n, hechos) => [
      '**Ventas** es todo el dinero que entra. **Ganancia** es lo que te queda después de pagar los materiales y los pagos del mes.',
      hechos.precio
        ? `En tu negocio: vendes cada ${r.unidad} a **${soles(n.precio)}** y te cuesta **${soles(n.costoUnidad, { decimales: 2 })}**. Tu ganancia no son ${soles(n.precio)}: son **${soles(n.gananciaUnidad, { decimales: 2 })}** por cada ${r.unidad}.`
        : `Ejemplo: vendes ${r.un} ${r.unidad} a S/ 20 y te cuesta S/ 15. Tu ganancia no son S/ 20: son **S/ 5**.`,
      'Por eso un mes con muchas ventas puede dejar poca ganancia: si subió el material, si diste descuentos o si hubo gastos que no contaste.',
    ],
    pregunta: () => ({
      texto: 'Este mes vendiste S/ 1,000. Gastaste S/ 600 en materiales y S/ 300 en alquiler y luz. ¿Cuánto ganaste?',
      opciones: ['S/ 1,000', 'S/ 400', 'S/ 100'],
      correcta: 2,
      porQue: 'Ganancia = ventas − gastos. S/ 1,000 − S/ 600 − S/ 300 = S/ 100.',
    }),
    accion: { texto: 'Ver mi precio de venta', ruta: '/precio' },
  },

  // ---------- Módulo 2: cuidar el dinero ----------
  {
    id: 'precio',
    modulo: 'cuidar',
    emoji: '🏷️',
    titulo: 'No regales tu trabajo',
    tarjetas: () => [
      'Si cobras **menos de lo que te cuesta**, cada venta te hace perder dinero, aunque vendas mucho.',
      '**Tu tiempo también cuesta.** Si tu precio no incluye el pago de tus horas, estás trabajando gratis.',
      'En vez de bajar el precio, **compite con lo que te hace diferente**: calidad, puntualidad y buen trato.',
    ],
    pregunta: (r) => ({
      texto: `Te cuesta S/ 15 hacer ${r.un} ${r.unidad}. Un cliente te ofrece S/ 13. Si aceptas, ¿qué pasa?`,
      opciones: ['Gano S/ 13', 'Pierdo S/ 2', 'No gano ni pierdo'],
      correcta: 1,
      porQue: 'S/ 13 − S/ 15 = − S/ 2. Cada vez que vendes a ese precio, pierdes S/ 2.',
    }),
    accion: { texto: 'Calcular el costo de mis productos', ruta: '/costeo' },
  },
  {
    id: 'inventario',
    modulo: 'cuidar',
    emoji: '📦',
    titulo: 'Tus materiales también son dinero',
    tarjetas: () => [
      'El material guardado es **dinero que ya gastaste**. Si se malogra, se pierde o se desperdicia, pierdes ese dinero.',
      'Lleva la cuenta de **cuánto tienes** y ponle un **mínimo** a cada material: así compras a tiempo, sin quedarte sin material ni comprar de más.',
      'Compra lo que vas a usar pronto. **El material parado es dinero que no trabaja.**',
    ],
    pregunta: () => ({
      texto: '¿Para qué sirve ponerle un mínimo a cada material?',
      opciones: ['Para comprar antes de que se acabe', 'Para gastar más', 'No sirve para nada'],
      correcta: 0,
      porQue: 'Cuando llegas al mínimo, la app te avisa y compras a tiempo: no dejas de trabajar por falta de material.',
    }),
    accion: { texto: 'Ir a mi inventario', ruta: '/inventario' },
  },
  {
    id: 'fiado',
    modulo: 'cuidar',
    emoji: '🤝',
    titulo: 'Cuidado con el fiado',
    tarjetas: (r) => [
      'Fiar puede ayudarte a vender, pero **el dinero que te deben no te sirve** para comprar material hoy.',
      'Si fías, **anota quién, cuánto y cuándo te paga**. Y ponte un límite: no fíes más de lo que podrías perder.',
      `Para los pedidos, **pide un adelanto** antes de empezar, por ejemplo la mitad. Así cubres los materiales de ${r.ejemploUnidad} aunque el cliente no vuelva.`,
    ],
    pregunta: (r) => ({
      texto: `Un cliente te encarga 10 ${r.unidades} para dentro de dos semanas. ¿Qué es lo más seguro?`,
      opciones: ['Hacer todo y cobrar al entregar', 'Pedir un adelanto para los materiales', 'Que me pague cuando pueda'],
      correcta: 1,
      porQue: 'Con el adelanto no pones tu dinero en riesgo: si el cliente no vuelve, al menos cubriste los materiales.',
    }),
  },
  {
    id: 'ahorro',
    modulo: 'cuidar',
    emoji: '🐷',
    titulo: 'Ahorra primero, gasta después',
    tarjetas: (r, n) => [
      'El ahorro no es lo que sobra al final del mes, porque casi nunca sobra. **Sepáralo apenas cobras**, aunque sea poco.',
      n.fijos > 0
        ? `Arma un **fondo para emergencias**: por si se malogra una herramienta o un mes vendes poco. Una buena meta es juntar 3 meses de tus pagos fijos. Para ti: 3 × ${soles(n.fijos)} = **${soles(n.fijos * 3)}**.`
        : 'Arma un **fondo para emergencias**: por si se malogra una herramienta o un mes vendes poco. Una buena meta es juntar lo que pagas en 3 meses de alquiler, luz y otros pagos fijos.',
      'Guárdalo **aparte y en un lugar seguro**, por ejemplo una cuenta de ahorro en una entidad supervisada, para no gastarlo sin darte cuenta.',
    ],
    pregunta: () => ({
      texto: '¿Cuál es la mejor forma de ahorrar?',
      opciones: ['Guardar lo que sobre a fin de mes', 'Separar un monto apenas cobro', 'Esperar a vender más para empezar'],
      correcta: 1,
      porQue: 'Si separas primero, el ahorro sí ocurre. Lo que "sobra" al final casi siempre ya se gastó.',
    }),
  },

  // ---------- Módulo 3: crecer y formalizarse ----------
  {
    id: 'prestamos',
    modulo: 'crecer',
    emoji: '🏦',
    titulo: 'Antes de pedir un préstamo',
    tarjetas: () => [
      'Un préstamo conviene si es para algo que **te hace ganar más** (una máquina, material para un pedido grande) y ya sabes **con qué ventas lo vas a pagar**.',
      'Compara la **TCEA** (Tasa de Costo Efectivo Anual). Es lo que te cuesta de verdad el préstamo, con intereses y comisiones. **La TCEA más baja es la más barata.**',
      'Pide solo a **entidades supervisadas por la SBS** (se puede consultar en su página web). Aléjate de los préstamos **"gota a gota"**: cobran intereses altísimos y amenazan a quien se atrasa.',
    ],
    pregunta: () => ({
      texto: 'Te ofrecen dos préstamos de S/ 2,000: uno con TCEA de 35% y otro con TCEA de 90%. ¿Cuál te cuesta menos?',
      opciones: ['El de 35%', 'El de 90%', 'Cuestan lo mismo'],
      correcta: 0,
      porQue: 'La TCEA incluye todo lo que pagas por el préstamo. Mientras más baja, menos pagas.',
    }),
  },
  {
    id: 'formalizar',
    modulo: 'crecer',
    emoji: '🪪',
    titulo: 'Para qué sirve formalizarte',
    tarjetas: () => [
      'Formalizarte es **sacar tu RUC**: el número con el que tu negocio existe para el Estado. No es solo pagar impuestos, es **poder crecer**.',
      '**Lo que ganas:** puedes dar **boleta**, venderle a empresas e instituciones, entrar a ferias y a compras del Estado, y pedir **créditos en bancos y cajas**, que casi siempre piden RUC. También entras a programas de apoyo para emprendedores.',
      '**Los problemas que te ahorras:** multas de la SUNAT, que te decomisen la mercadería, perder un pedido grande por no poder dar comprobante y tener que trabajar escondido.',
      'Formalizarte también te ordena: cuando das comprobantes, tus cuentas se llevan solas y sabes de verdad cuánto vendes.',
    ],
    pregunta: (r) => ({
      texto: `Una institución te encarga 200 ${r.unidades}, pero necesita un comprobante de pago. Si no tienes RUC…`,
      opciones: ['Le vendo igual, no pasa nada', 'Pierdo la venta o tengo que pedirle el favor a otro', 'Le hago un recibo a mano y listo'],
      correcta: 1,
      porQue: 'Sin RUC no puedes emitir boleta ni factura. Muchas ventas grandes se pierden justo por eso.',
    }),
  },
  {
    id: 'nrus',
    modulo: 'crecer',
    emoji: '🧾',
    titulo: 'El Nuevo RUS: formalizarte es más fácil de lo que crees',
    tarjetas: (r, n, hechos) => [
      'El **Nuevo RUS** es el régimen más simple de la SUNAT, hecho para negocios pequeños como el tuyo: **pagas una cuota fija al mes** y ya está. Sin contador, sin libros contables, sin declaraciones complicadas.',
      'Son **dos categorías**, según cuánto vendes o compras al mes: hasta **S/ 5,000** pagas **S/ 20 al mes**; hasta **S/ 8,000** pagas **S/ 50 al mes**. (Montos del Nuevo RUS: confírmalos en sunat.gob.pe, pueden cambiar.)',
      hechos.precio && n.precio > 0 && n.cantidad > 0
        ? `Si vendieras todo lo que puedes hacer (${n.cantidad} ${r.unidades} × ${soles(n.precio)} = **${soles(n.precio * n.cantidad)}** al mes), te tocaría la **categoría ${n.precio * n.cantidad <= 5000 ? '1: S/ 20' : '2: S/ 50'} al mes**. Compáralo con lo que pagas de luz.`
        : 'Ponle números: si vendes S/ 3,000 al mes, pagas **S/ 20**. Es menos de lo que muchos pagan de luz.',
      '**Sacar el RUC es gratis** y se hace con tu DNI, por internet en la web o la app de la SUNAT, o yendo a un centro de servicios. Después emites tus boletas desde el celular.',
      '**Ojo:** con el Nuevo RUS emites **boleta**, no factura. Si tus clientes son empresas que piden factura, pregunta por el **Régimen MYPE Tributario**.',
    ],
    pregunta: () => ({
      texto: 'Vendes S/ 3,000 al mes y estás en el Nuevo RUS. ¿Cuánto pagas de impuesto al mes?',
      opciones: ['S/ 20, una cuota fija', 'El 18% de todo lo que vendo', 'S/ 300'],
      correcta: 0,
      porQue: 'Hasta S/ 5,000 al mes estás en la categoría 1: una cuota fija de S/ 20, sin más declaraciones.',
    }),
    accion: { texto: 'Hablar con un asesor sobre esto', ruta: '/asesores' },
  },
]

export const LECCION = Object.fromEntries(LECCIONES.map((l) => [l.id, l]))
