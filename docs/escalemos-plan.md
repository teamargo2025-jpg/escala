# Escalemos y EcoEscala · ideas a implementar

Lista acordada el 26 de septiembre de 2026. **Construido: oportunidades, sobrantes, revista y EcoEscala.**
**En pausa por decisión del 26/09: proveedores, compra conjunta y directorio de aliados.**
Cada bloque dice qué hace, por qué, qué tan caro es y qué decisión falta antes de empezar.

**La idea que ordena todo:** Instagram y la revista dan **vistas**; la app da **ahorro y gestión**.
Escalemos vive de dos verbos: **ahorrar** (sobrantes, proveedores, compras, eco) y **mostrar** (oportunidades, revista).
Lo que solo redirige a Instagram se vuelve obsoleto; lo que guarda estado y recibe respuestas, no.

---

## 1. Oportunidades ⭐ empezar por aquí

Tablero donde **el equipo publica** y los emprendedores responden: ferias, convocatorias, un pedido grande
para repartir entre varios talleres, un crédito, un taller, el cierre de postulaciones a la revista.
Cada una con botón **"Me interesa"**; ustedes ven la lista de interesados.

- **Por qué:** es lo que Instagram hace mal (las convocatorias se pierden en el feed y nadie sabe quién se apuntó).
  Hace que la app sea el lugar donde pasan cosas buenas, que es la razón por la que alguien vuelve a abrirla.
- **Riesgo:** ninguno. No hay contenido de usuarios ni moderación.
- **Costo:** bajo. Una tabla en Supabase que se edita desde el panel, una pantalla de lista y el registro de interesados.
- **Decisión pendiente:** ¿alguien de marketing publica 2 a 4 oportunidades al mes, de forma sostenida?
  **Si la respuesta es no, Escalemos no se construye.**

## 2. Postularme a la revista

Formulario con fotos, qué vendo y mi historia. Queda con estado visible: *enviado → en revisión → seleccionado*.
La selección se hace desde el panel de Supabase; la publicación sigue siendo en Instagram y en la revista.

- **Por qué:** nadie se postula dentro de un post. Y el estado ("me falta enviar la foto") solo vive en la app.
- **Riesgo:** bajo. El material se revisa antes de publicarse, y se publica fuera de la app.
- **Costo:** bajo-medio. Necesita subir fotos a almacenamiento público (hoy la foto de marca vive dentro de los
  datos privados y no sirve para esto).
- **Decisión pendiente:** cada cuánto sale la revista y cuántos entran por edición.

## 3. Sobrantes: "Doy / Busco" ⭐ la de mejor relación valor/esfuerzo

Tablero de dos verbos: **Doy** lo que me sobra, **Busco** lo que necesito. Foto, qué es, cuánto, zona y contacto por WhatsApp.
El transporte y el acuerdo los resuelven ellos; la app solo conecta.

- **Por qué:** el residuo de uno es el insumo gratis de otro, y la app ya sabe qué materiales usa cada rubro.
  Ahorro inmediato y medible. Enlaza con el inventario: si sobró material, sugerir publicarlo.
- **Ejemplos:** retazos de tela → manualidades y trapo industrial (los talleres lo compran); recortes de fierro →
  soportes y adornos; aserrín → camas de mascota y compost; cartón → empaque y moldes; PET → maceteros;
  cabello de peluquería → compost y absorbentes de aceite.
- **Riesgo:** bajo. Sin dinero de por medio y entre gente que ya se conoce de la capacitación.
- **Costo:** bajo. Lista con foto, estado (disponible / entregado) y botón de contacto.

## 4. Proveedores de confianza

Lista colectiva: proveedor, zona, qué vende, precio de referencia y **la fecha en que alguien confirmó ese precio**.

- **Por qué:** hoy ese conocimiento vive en la cabeza de cada persona y se pierde. Es lo más barato de construir.
- **Riesgo:** bajo. El único cuidado es la fecha: un precio sin fecha no es confiable.
- **Costo:** muy bajo.

## 5. EcoEscala

Tres piezas, en este orden:

**a) Residuo → insumo.** Es el punto 3, visto desde lo ambiental. Misma pantalla, otra puerta de entrada.

**b) Talleres de transformación como premio.** "Qué hacer con tus retazos". El premio son cosas que ustedes
**ya producen** (capacitación, asesoría, diseño para redes, mención en la revista, destacado en Escalemos):
costo adicional casi cero, valor alto para quien lo recibe. Sistema de puntos canjeables.

**c) Jornadas de acopio, no acopio permanente.** Un día al mes en la sede, para lo que nadie puede reaprovechar.
La app lleva el calendario, cuánto entregó cada quien (lo registra el facilitador) y los puntos.

- **Por qué en ese orden:** el reciclable pagado por kilo vale centavos; como insumo gratis para otro emprendedor
  vale lo que cuesta comprarlo nuevo. Y los productos hechos con material recuperado son la mejor historia para la revista.
- **Riesgo:** el acopio permanente es una operación logística (local, balanza, horarios, alguien que reciba).
  Muere cuando esa persona se cansa. Por eso: jornadas, y mejor aliarse con recicladores formalizados de la
  municipalidad que montar la operación.
- **Costo:** medio. Los puntos necesitan que alguien registre los kilos.
- **Decisiones pendientes:** ¿hay local y un día al mes? ¿quién registra los kilos y quién entrega los premios,
  y con cuántos cupos al mes? ¿hay contacto con la municipalidad o con recicladores formalizados?

## 6. Compra conjunta — al final, y con cuidado

La app **solo junta la demanda**: quién quiere cuánto de qué, hasta qué fecha y quién es el responsable del pedido.
**El dinero y la compra ocurren fuera de la app.**

- **Por qué al final:** es donde se rompen los grupos (uno pone y otro no, el reparto sale desparejo, el material
  llega fallado). Si la institución hace de intermediaria, el reclamo es contra la institución.
- **Antes de construir nada:** hacer **una compra piloto a mano**, de un solo material, y ver qué pasa en la vida real.

## 7. Directorio de aliados — solo si lo piden

Buscar dentro de la red por rubro y zona, para encontrar **proveedores y socios, no clientes**
(un emprendedor no es cliente de otro, pero sí puede ser su proveedor).

- **Por qué esperar:** es la parte que más se parece a una red social y la que más fácil se queda vacía.
  Si el piloto lo pide, se hace; si no, no.

---

## Lo que cambia por dentro cuando se construya esto

- **Separar público de privado.** Hoy cada cuenta solo ve lo suyo, y esa es la promesa que le hicimos a la gente.
  Todo lo publicable va en tablas aparte, con consentimiento propio, **opt-in** y botón de "quitar mi publicación"
  que funcione al instante. El DNI nunca se acerca a esa zona.
- **Fotos públicas en almacenamiento.** Las fotos que se ven fuera no pueden vivir dentro de los datos privados.
- **Moderación ligera:** estado pendiente/aprobado, botón de reportar y reglas escritas. Al inicio se aprueba
  desde el panel de Supabase, sin programar pantalla.
- **Cobrar cambia el estatus:** el plan gratuito de Vercel es para uso no comercial. Si se vende exposición hay que
  pasar a planes pagos (unos US$ 45 al mes entre Vercel y Supabase) y emitir comprobantes.
  El destacado se **vende por el alcance de la revista y se gestiona en la app**; el pago, al inicio, manual (Yape).

---

## Pendientes de antes, que siguen abiertos

1. Completar en `src/data/legal.js` el nombre de la institución responsable y su correo de contacto.
2. Ejecutar `supabase/002_eventos.sql` si se quiere medir el piloto (conteo anónimo, opcional).
3. Confirmar quién responde legalmente por los datos: la institución o el responsable a título personal.
4. Revisar los mensajes de error de los formularios después del primer piloto.

---

## Orden recomendado de construcción

1. Oportunidades
2. Sobrantes (Doy / Busco)
3. Proveedores
4. Postularme a la revista
5. EcoEscala (jornadas y puntos)
6. Compra conjunta
7. Directorio de aliados, solo si lo piden

**Lo único que bloquea el arranque:** que alguien se comprometa a publicar oportunidades cada mes.
