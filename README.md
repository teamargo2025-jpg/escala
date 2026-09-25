# ESCALA

App para el celular: cada participante crea su cuenta (nombre + DNI), elige su rubro y trabaja por apartados desde un lobby: su plan (presupuesto, costos, precio, meta, flujo de caja), su día a día (control de caja, inventario, costo por producto) y educación financiera. Ver [PROYECTO.md](PROYECTO.md).

**En línea:** https://escala-nine-rho.vercel.app/ · QR para proyectar: `qr-escala.png` (o `qr-escala.svg` para imprimir en grande).

```bash
npm install
npm run dev      # abre en la red local: prueba desde tu celular con la IP que muestra
npm test         # pruebas de cálculos, cuentas y caja
npm run build    # genera dist/ para Vercel
```

Sin `.env.local` la app corre en **modo prueba**: las cuentas se guardan solo en ese navegador (aparece un aviso amarillo en la bienvenida).

## Configurar Supabase (una sola vez)

1. **Crear el proyecto** en supabase.com. Región sugerida: *South America (São Paulo)*.
2. **Crear las tablas:** SQL Editor → New query → pegar [supabase/001_inicial.sql](supabase/001_inicial.sql) → Run.
3. **Quitar la confirmación por correo:** Authentication → Sign In / Providers → Email → desactivar **Confirm email** → Save. Las cuentas usan un correo interno que no existe; si queda activado, nadie puede crear cuenta.
4. **Subir el límite de ingresos:** Authentication → Rate Limits → *sign-ups and sign-ins* a un valor alto (por ejemplo 300 cada 5 minutos). En clase todos los celulares salen por el mismo WiFi y Supabase los cuenta como una sola persona.
5. **Conectar la app:** Project Settings → API Keys → copiar *Project URL* y la *publishable key*:
   - En tu computadora: copiar `.env.example` como `.env.local` y pegarlas.
   - En Vercel: Project → Settings → Environment Variables → agregar `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` (Production y Preview) → Deployments → Redeploy.

6. **Opcional, conteo anónimo de uso:** SQL Editor → pegar [supabase/002_eventos.sql](supabase/002_eventos.sql) → Run. Sin esta tabla la app funciona igual; con ella puedes ver cuántos crean cuenta y cuántos terminan cada apartado (las consultas están al final del archivo).

7. **Escalemos y EcoEscala:** SQL Editor → pegar [supabase/003_escalemos.sql](supabase/003_escalemos.sql) → Run. Trae dos oportunidades y una jornada de ejemplo para que no se vea vacío; bórralas o edítalas desde Table Editor.

**Comprobar que todo quedó bien:** `npm run probar:supabase` crea dos cuentas de prueba y revisa registro, entrada, guardado y que ninguna cuenta vea datos ajenos. Luego bórralas en Authentication → Users (empiezan con `pruebaescala`).

**Pendiente antes del piloto:** completar en `src/data/legal.js` el nombre de la institución responsable y su correo de contacto (aparecen entre corchetes).

**Antes de cada clase:** el plan gratuito de Supabase pausa el proyecto tras 7 días sin uso. Entra al panel y, si dice *Paused*, pulsa *Restore*.

**Si alguien olvida con qué nombre se registró:** Authentication → Users. El correo interno es el nombre sin tildes, espacios ni mayúsculas (María José → `mariajose@cuentas.escala.invalid`).

## Dónde cambiar cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Fórmula del precio, meses del flujo, redondeo, % rápidos | `src/config.js` |
| Listas, precios de ejemplo y textos de cada oficio, o agregar un oficio | `src/data/rubros.js` |
| Materiales y productos de ejemplo por oficio (inventario y costeo) | `src/data/materiales.js` |
| Lecciones de educación financiera | `src/data/educacion.js` |
| Apartados del lobby, su orden y de qué dependen | `src/lib/apartados.js` |
| Cálculos del plan / de la caja / del inventario y costeo / reglas de nombre y DNI | `src/lib/calc.js`, `src/lib/caja.js`, `src/lib/inventario.js`, `src/lib/cuenta.js` |
| Conexión con Supabase (y modo prueba) | `src/almacen.js` |
| Guardado en el celular, sincronización y navegación | `src/negocio.js` |
| Pantallas | `src/pantallas/` (entrada, lobby, apartados, caja, inventario, costeo, educacion) |
| Colores y tamaños | `src/estilos.css` |
| Política de privacidad y términos (y los datos de la institución) | `src/data/legal.js` |
| Fechas de marketing e ideas de contenido | `src/lib/marketing.js`, `src/data/marca.js` |
| Íconos de la app | `public/icono.svg` y `node scripts/generar-iconos.mjs` |
| Puntos por material, premios e ideas de EcoEscala | `src/data/eco.js` |
| Oportunidades, jornadas y postulaciones (día a día) | panel de Supabase → Table Editor |
