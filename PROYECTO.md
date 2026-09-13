# ESCALA

> App para el celular que guía, paso a paso y con ejemplos de su oficio, a emprendedores en capacitación para armar su presupuesto, su precio de venta, su meta de ventas y su flujo de caja.

*Última actualización: 13 de septiembre de 2026*

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

**Facilitador (tú).** Proyecta el material con cañón multimedia y guía la sesión. En la v1 no necesita ver los datos de los participantes.

## Qué hace la primera versión

Un solo recorrido guiado, una pregunta a la vez, en este orden (cada paso usa lo anterior):

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
| Cuentas y contraseñas | En clase, crear cuentas se come media sesión y trae olvidos de clave. Guardar en el celular basta. |
| Panel del facilitador con los resultados de todos | Obliga a base de datos y a manejar datos personales de un grupo vulnerable. Se agrega solo si en la práctica hace falta. |
| Exportar a PDF | La captura de pantalla cumple lo mismo y todos saben hacerla. |
| Gráficos elaborados | Una barra simple basta para ver positivo/negativo. Lo interactivo cuesta más que todo lo demás. |
| Más rubros | Primero validar los tres. Agregar uno después es cargar ejemplos, no programar. |
| Impuestos, depreciación de equipos | Complican el recorrido. Entran solo si la PPT los enseña (ver preguntas abiertas). |
| Funcionar sin internet | En la clase hay internet. |

## Cómo sabremos que funcionó

En una sesión real, **al menos 8 de cada 10 participantes llegan a la pantalla de resumen** con números coherentes de su propia idea (precio mayor que el costo, meta alcanzable), dentro del tiempo de la práctica. Sobre todo, **sin que el facilitador tenga que llenarles los campos**.

*(Umbral propuesto; ajústalo a tu criterio.)*

## Restricciones

- **Equipo:** una persona, con Claude Code.
- **Presupuesto:** cero. Todo en planes gratuitos.
- **Fecha:** hay capacitación pendiente, sin fecha cerrada ("aún hay tiempo").
- **Stack:** Vite + React, desplegado en Vercel. Sin backend en la v1; datos en el almacenamiento del navegador.
- **Uso:** celulares de gama variada, pantalla chica. Botones grandes, poco texto por pantalla.
- **Moneda:** soles.

## Riesgos y supuestos

| Qué asumimos / qué puede fallar | Impacto | Cómo lo comprobamos barato |
|---|---|---|
| Una persona del perfil puede completar el recorrido sola, en su celular, en el tiempo de clase | Si no, la app no sirve aunque calcule bien | Fase 1: costos + precio de un rubro, probado con 2–3 personas sin explicarles nada |
| Los ejemplos y precios sugeridos son realistas para la zona | Si no, pierden credibilidad al instante | Revisar las listas con alguien de cada oficio antes de la fase 3 |
| "Tradicional" = precio = costo + % de ganancia **sobre el costo** | Si la PPT usa otra fórmula, la app confunde | Confirmar contra la diapositiva de precio antes de la fase 1 |
| Flujo de caja a 3 meses, por mes | Si la PPT usa semanas u otro plazo, hay que rehacer esa pantalla | Confirmar contra la PPT antes de la fase 2 |
| El plan gratuito de Vercel aplica (uso no comercial) | Si la institución cobra el curso, habría que revisarlo | Confirmar con la institución |
| Los celulares de los participantes abren una web moderna sin problema | Algún celular muy antiguo podría fallar | Probar en el celular más viejo que se consiga durante la fase 1 |

## Decisiones tomadas

- **Recorrido guiado, no plantilla digital.** El problema del papel es la hoja vacía; copiarla a una pantalla no lo resuelve.
- **Costos preguntados sin jerga.** "Lo que pagas aunque no vendas" en vez de "costo fijo". El término se muestra después, como aprendizaje.
- **Sin cuentas ni base de datos en la v1.** Menos fricción en clase y ningún dato personal fuera del celular.
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

- [ ] Crear proyecto Vite + React en `Proyectos/ESCALA`
- [ ] Subir a un repositorio y conectarlo a Vercel
- [ ] Pantalla de inicio con "Elige tu rubro" (tres botones, sin lógica)
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

### Fase 3 — Los tres rubros y ensayo en clase

**Objetivo:** dejarla lista para una sesión real.
**Duración estimada:** 4 a 6 días.
**Terminó cuando:** se hizo una sesión piloto con proyector y celulares de los participantes, y se midió cuántos llegaron al resumen.

- Ejemplos y listas de soldadura/mecánica y estilismo, revisados por alguien de cada oficio
- Pulir lo que haya salido de la fase 1 y 2

### Fase 4 — Lo que pida la sesión piloto

Se define después del piloto. Candidatos: panel del facilitador, más rubros, PDF, gráficos, impuestos.
