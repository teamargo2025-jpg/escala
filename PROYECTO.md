# ESCALA

> App para el celular que guía, paso a paso y con ejemplos de su oficio, a emprendedores en capacitación para armar su presupuesto, su precio de venta, su meta de ventas y su flujo de caja, y luego llevar el control de caja de su negocio en el día a día.

*Última actualización: 15 de septiembre de 2026 (v3: educación financiera, inventario y costo por producto)*

## El problema

En la capacitación de costos, la teoría se da con una PPT y la práctica con plantillas de papel. Las plantillas fallan por tres cosas:

- **Son poco atractivas.**
- **Enfrentan a la persona con una hoja vacía:** no sabe qué poner en cada casilla y se equivoca.
- **Quien no maneja los términos** (costo fijo, variable, margen) no puede llenar una casilla que los usa.

Resultado: la parte práctica no deja a cada persona con los números de *su* negocio bien hechos.

## Para quién

**Participantes de la capacitación.** Son personas en situación vulnerable, emprendedores o por emprender, en tres rubros:

- Costura / confección
- Soldadura / mecánica
- Estilismo / peluquería

Usan **solo su propio celular**, dentro de la clase, con internet disponible. El nivel de manejo de números y de tecnología es variable; hay que diseñar para el más bajo.

**Facilitador (tú).** Proyecta el material con cañón multimedia y guía la sesión. Por ahora no ve los datos de los participantes.

Después de la capacitación, los participantes siguen usando el **control de caja** en su vida diaria, desde su celular.

## Qué hace la versión 2

**Entrada con cuenta.** Al abrir por primera vez, una pregunta por pantalla:

1. **¿Cómo te llamas?** Es su usuario (sin importar mayúsculas, tildes ni espacios).
2. **¿Cómo se llama tu emprendimiento?**
3. **Tu DNI** (o carné de extranjería). Es su clave. Acepta que se guarden sus datos.
4. **¿De qué rubro es?** Se cargan los ejemplos de ese oficio.

Las siguientes veces entra con nombre + DNI, o directo si la sesión sigue abierta en su celular.

**Lobby.** Saludo con su nombre y el de su emprendimiento, un resumen "Tu negocio hoy" con los números clave, y una tarjeta por apartado con su estado (hecho ✓, siguiente sugerido, bloqueado con "Primero: …"). Botón para enviar el resumen por WhatsApp.

**Apartados** (cada uno se entra, se completa con "Listo" y vuelve al lobby):

| # | Apartado | Qué tiene | Requiere |
|---|---|---|---|
| 1 | Presupuesto de arranque | Herramientas y gastos iniciales → inversión total | — |
| 2 | Costos del mes | Fijos, variables y cuántas unidades puede hacer al mes | — |
| 3 | Precio de venta | Costo por unidad + % de ganancia | 2 |
| 4 | Meta de ventas | Punto de equilibrio y unidades para su ganancia deseada | 3 |
| 5 | Flujo de caja (plan) | Proyección a 3 meses | 1 y 3 |
| 6 | Control de caja | Registro real: "Entró dinero" / "Salió dinero", saldo, resumen del mes, ventas contra punto de equilibrio. Al vender un producto con ficha, usa su precio y descuenta sus materiales | — |
| 7 | Inventario | Materiales con medida, cantidad, costo por medida (promedio al comprar) y mínimo con alerta. "Compré" (se puede anotar en caja), "Usé" (un material o lo que llevan N productos) y "Conté" | — |
| 8 | Costo por producto | Ficha por producto o servicio: materiales que usa × su costo + horas × valor de la hora + parte de los pagos del mes → costo, precio sugerido y comparación con el precio actual. Ejemplos por oficio | — |
| 9 | Educación financiera | 8 lecciones de 2 minutos con ejemplos del oficio y de sus números, cada una con una pregunta: separar dinero, ventas vs. ganancia, anotar, ahorro, préstamos (TCEA, SBS, gota a gota), fiado, precio, inventario | — |

El lobby agrupa los apartados en **Tu plan** (1–5), **Tu negocio día a día** (6–8) y **Aprende** (9).

Además:
- Cada campo tiene "¿qué pongo aquí?" con un ejemplo del rubro elegido.
- Los datos se guardan en Supabase y también en el celular: si se corta el internet, sigue funcionando y sube los cambios al volver.
- Quien usó la v1 en ese celular puede traer sus números al crear su cuenta.

## Qué hacía la primera versión (histórico)

Un solo recorrido guiado, sin cuentas y con datos solo en el celular:

1. **Elige tu rubro.** Se cargan sugerencias y ejemplos de ese oficio.
2. **Lo que necesitas para arrancar.** La app sugiere herramientas, máquinas y gastos iniciales del rubro; la persona marca y pone precio. Ve **cuánto dinero necesita para empezar**.
3. **Tus costos del mes.** Preguntados en lenguaje simple: "lo que pagas aunque no vendas nada" (fijos) y "lo que gastas por cada prenda / trabajo / servicio" (variables).
4. **Tu precio.** Costo por unidad + el % de ganancia que quiere, y ve **su precio de venta**.
5. **Tu meta.** Ve **cuántas unidades tiene que vender al mes para no perder** (punto de equilibrio) y cuántas para ganar lo que quiere.
6. **Tu flujo de caja a 3 meses.** Armado con lo anterior; la persona solo ajusta cuánto cree vender cada mes y ve si cada mes queda en positivo o negativo.
7. **Resumen.** Una pantalla con los números clave, lista para captura o para compartir por WhatsApp.

Además:
- Cada campo tiene "¿qué pongo aquí?" con un ejemplo del rubro elegido.
- El avance se guarda en el celular: si se cierra el navegador, no se pierde.
- Se entra con un enlace o un QR proyectado. Sin cuentas.

## Qué NO hace (por ahora)

| Fuera | Por qué |
|---|---|
| Panel del facilitador con los resultados de todos | Ya hay base de datos, pero ver datos de otros exige más cuidado con la privacidad. Se agrega solo si en la práctica hace falta. |
| Recuperar la cuenta sin ayuda | Sin correo real no hay "olvidé mi clave". El facilitador busca el nombre en Supabase. |
| Exportar a PDF | La captura de pantalla cumple lo mismo y todos saben hacerla. |
| Gráficos elaborados | Una barra simple basta para ver positivo/negativo. Lo interactivo cuesta más que todo lo demás. |
| Más rubros | Primero validar los tres. Agregar uno después es cargar ejemplos, no programar. |
| Impuestos, depreciación de equipos | Complican el recorrido. Entran solo si la PPT los enseña (ver preguntas abiertas). |
| Entrar por primera vez sin internet | Crear cuenta o entrar necesita conexión; después, si se corta, la app sigue y sincroniza al volver. |

## Cómo sabremos que funcionó

En una sesión real, **al menos 8 de cada 10 participantes llegan a la pantalla de resumen** con números coherentes de su propia idea (precio mayor que el costo, meta alcanzable), dentro del tiempo de la práctica. Sobre todo, **sin que el facilitador tenga que llenarles los campos**.

*(Umbral propuesto; ajústalo a tu criterio.)*

## Restricciones

- **Equipo:** una persona, con Claude Code.
- **Presupuesto:** cero. Todo en planes gratuitos.
- **Fecha:** hay capacitación pendiente, sin fecha cerrada ("aún hay tiempo").
- **Stack:** Vite + React en Vercel, Supabase (Auth + Postgres) para cuentas y datos. Usa 1 de los 2 proyectos gratuitos de Supabase.
- **Uso:** celulares de gama variada, pantalla chica. Botones grandes, poco texto por pantalla.
- **Moneda:** soles.

## Riesgos y supuestos

| Qué asumimos / qué puede fallar | Impacto | Cómo lo comprobamos barato |
|---|---|---|
| Una persona del perfil puede completar el recorrido sola, en su celular, en el tiempo de clase | Si no, la app no sirve aunque calcule bien | Fase 1: costos + precio de un rubro, probado con 2–3 personas sin explicarles nada |
| El DNI como clave es aceptable para el grupo y la institución | El DNI es dato personal (Ley 29733) y no es secreto: quien sepa el nombre y el DNI de alguien entra a su cuenta | Consultar con la institución antes del piloto. El DNI solo viaja cifrado a Supabase Auth; nunca va a una tabla ni se guarda en el celular |
| Todos crean cuenta a la vez desde el mismo WiFi | Supabase limita ingresos por IP: parte del grupo podría quedar bloqueada | Subir el límite en Authentication → Rate Limits antes del piloto y probar con 5 celulares |
| El proyecto de Supabase está activo el día de clase | El plan gratuito pausa tras 7 días sin uso y nadie puede entrar | Revisar el panel el día anterior |
| Nombres repetidos o escritos distinto al entrar | La persona no puede entrar | Nombre sin tildes, mayúsculas ni espacios; mensaje para agregar apellido; el facilitador busca en Supabase |
| Las lecciones de educación financiera son correctas y claras para el grupo | Un dato errado (préstamos, SBS) daña la confianza | Revisar `src/data/educacion.js` con el equipo de la capacitación antes del piloto |
| Los consumos de ejemplo (metros de tela por polo, ml de shampoo por servicio) son realistas | Costos que no reconocen | Revisar `src/data/materiales.js` junto con `rubros.js` con alguien de cada oficio |
| Los ejemplos y precios sugeridos son realistas para la zona | Si no, pierden credibilidad al instante | Revisar las listas con alguien de cada oficio antes de la fase 3 |
| "Tradicional" = precio = costo + % de ganancia **sobre el costo** | Si la PPT usa otra fórmula, la app confunde | Confirmar contra la diapositiva de precio antes de la fase 1 |
| Flujo de caja a 3 meses, por mes | Si la PPT usa semanas u otro plazo, hay que rehacer esa pantalla | Confirmar contra la PPT antes de la fase 2 |
| El plan gratuito de Vercel aplica (uso no comercial) | Si la institución cobra el curso, habría que revisarlo | Confirmar con la institución |
| Los celulares de los participantes abren una web moderna sin problema | Algún celular muy antiguo podría fallar | Probar en el celular más viejo que se consiga durante la fase 1 |

## Decisiones tomadas

- **Recorrido guiado, no plantilla digital.** El problema del papel es la hoja vacía; copiarla a una pantalla no lo resuelve.
- **Costos preguntados sin jerga.** "Lo que pagas aunque no vendas" en vez de "costo fijo". El término se muestra después, como aprendizaje.
- ~~Sin cuentas ni base de datos en la v1.~~ **Cambiado en v2 (15/09/2026):** cuentas con Supabase, para que los datos sigan a la persona y el control de caja le sirva en su vida diaria.
- **Usuario = nombre, clave = DNI** (o carné de extranjería). Fácil de recordar; se acepta que no es una clave secreta.
- **Lobby con apartados** en vez de un solo recorrido. El apartado sugerido ("Sigue aquí") mantiene la guía para quien empieza.
- **Plan (flujo de caja) y realidad (control de caja) separados.**
- **Supabase + copia en el celular:** la app no se detiene si se corta el internet en clase.
- **v3: inventario, fichas de costo y lecciones viven dentro de los datos del negocio** (no son tablas nuevas): no hubo que cambiar la base de datos y se sincronizan igual que el plan. El historial del inventario guarda los últimos 400 movimientos.
- **Costo por producto = materiales + mano de obra + parte de los pagos del mes.** El valor de la hora lo pone la persona; los pagos del mes salen de "Costos del mes" si ya lo completó.
- **Tres rubros con ejemplos propios.** La sugerencia concreta del oficio es lo que quita la hoja en blanco.
- **Precio por costo + % sobre el costo** (método "tradicional"; pendiente de confirmar).
- **Flujo de caja corto: 3 meses** (pendiente de confirmar el plazo exacto).
- **Nombre provisional:** ESCALA.

## Preguntas abiertas

| Pregunta | Quién responde | Para cuándo |
|---|---|---|
| ¿La PPT calcula el precio como costo + % sobre el costo? | Tú, revisando la PPT | **Bloquea la fase 1** |
| ¿El flujo de caja es a 3 meses por mes, o por semanas? | Tú, revisando la PPT | Antes de la fase 2 |
| ¿La PPT enseña impuestos o depreciación de equipos? | Tú | Antes de la fase 2 |
| ¿Cuánto dura la parte práctica de la sesión? | Tú | Antes de la fase 2 (define cuántos pasos caben) |
| ¿Quién de cada oficio puede revisar las listas y precios de ejemplo? | Tú / la institución | Antes de la fase 3 |
| ¿Fecha de la capacitación? | Tú / la institución | Cuando se sepa; reordena las fases 3 y 4 |

## Plan por fases

### Fase 0 — El esqueleto que corre

**Objetivo:** tener la app vacía publicada y abriéndose en un celular desde un QR.
**Duración estimada:** medio día a 1 día.
**Terminó cuando:** escaneas un QR con tu celular y se abre la pantalla de inicio de ESCALA desde Vercel.

- [x] Crear proyecto Vite + React en `Proyectos/ESCALA`
- [x] Subir a un repositorio y conectarlo a Vercel
- [x] Pantalla de inicio con "Elige tu rubro" (tres botones, sin lógica)
- [ ] Generar un QR del enlace y abrirlo en tu celular

### Fase 1 — Costos y precio, para un rubro, probado con personas

**Objetivo:** despejar el riesgo principal: saber si alguien del perfil completa los pasos más difíciles sin ayuda.
**Duración estimada:** 4 a 6 días.
**Terminó cuando:** 2–3 personas del perfil (o parecidas) llegaron solas desde "tus costos" hasta ver su precio de venta, y anotaste dónde se trabaron.

- [ ] Confirmar la fórmula de precio contra la PPT
- [ ] Elegir el rubro de prueba (sugerido: confección) y escribir sus ejemplos de costos fijos y variables
- [ ] Pantallas de costos fijos y variables, una pregunta a la vez, con sugerencias marcables
- [ ] Botón "¿qué pongo aquí?" con ejemplo del rubro
- [ ] Pantalla de precio: costo por unidad + % de ganancia = precio de venta
- [ ] Probar en el celular más viejo que consigas
- [ ] Sesión de prueba con 2–3 personas: mirar, no ayudar, anotar trabas
- [ ] Ajustar textos según lo observado

### Fase 2 — El recorrido completo, para un rubro

**Objetivo:** que un participante pueda hacer la práctica entera, de inicio a resumen.
**Duración estimada:** 5 a 8 días.
**Terminó cuando:** en tu celular completas los 7 pasos para confección, cierras el navegador a mitad, vuelves y sigue donde estaba, y compartes el resumen por WhatsApp.

- Paso "lo que necesitas para arrancar" con total de inversión inicial
- Paso "tu meta": punto de equilibrio y unidades para la ganancia deseada
- Flujo de caja a 3 meses (o el plazo que confirme la PPT)
- Pantalla de resumen + botón compartir
- Guardado del avance en el celular

### Fase 2b — Cuentas, lobby y control de caja (v2)

**Objetivo:** que cada participante tenga su cuenta, trabaje por apartados y pueda seguir usando el control de caja después del curso.
**Terminó cuando:** desde dos celulares distintos entras con el mismo nombre + DNI y ves los mismos números y movimientos de caja.

- [x] Registro (nombre → emprendimiento → DNI → rubro) y entrada con nombre + DNI
- [x] Lobby con resumen y apartados con dependencias
- [x] Control de caja: entradas, salidas, saldo, resumen del mes, ventas contra punto de equilibrio
- [x] Guardado en el celular + sincronización con reintentos
- [x] Base de datos donde cada persona solo accede a lo suyo (`supabase/001_inicial.sql`)
- [ ] Crear y configurar el proyecto de Supabase (ver README)
- [ ] Probar en dos celulares, y con 5 celulares a la vez en el mismo WiFi
- [ ] Consultar con la institución el uso del DNI

### Fase 2c — Educación financiera, inventario y costo por producto (v3)

**Objetivo:** que la app acompañe el día a día del negocio y enseñe hábitos de manejo del dinero.
**Terminó cuando:** una persona registra sus materiales, calcula el costo de un producto, lo vende desde la caja y ve bajar su inventario; y completa una lección.

- [x] Inventario: materiales, compras (con costo promedio y anotación en caja), usos, conteos, alertas de mínimo
- [x] Costo por producto con materiales, trabajo y pagos del mes; precio sugerido y comparación
- [x] Vender un producto desde la caja descuenta sus materiales
- [x] 8 lecciones con pregunta y progreso en el lobby
- [ ] Revisar contenidos de lecciones y consumos de ejemplo
- [ ] Probar con 2–3 personas: ¿entienden "medida" y "cuánto usa uno"?

### Fase 3 — Los tres rubros y ensayo en clase

**Objetivo:** dejarla lista para una sesión real.
**Duración estimada:** 4 a 6 días.
**Terminó cuando:** se hizo una sesión piloto con proyector y celulares de los participantes, y se midió cuántos llegaron al resumen.

- Ejemplos y listas de soldadura/mecánica y estilismo, revisados por alguien de cada oficio
- Pulir lo que haya salido de la fase 1 y 2

### Fase 4 — Lo que pida la sesión piloto

Se define después del piloto. Candidatos: panel del facilitador, más rubros, PDF, gráficos, impuestos.
