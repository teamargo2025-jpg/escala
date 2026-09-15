# ESCALA

App para el celular: cada participante crea su cuenta (nombre + DNI), elige su rubro y trabaja por apartados desde un lobby: presupuesto de arranque, costos, precio, meta de ventas, flujo de caja y control de caja. Ver [PROYECTO.md](PROYECTO.md).

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

**Comprobar que todo quedó bien:** `npm run probar:supabase` crea dos cuentas de prueba y revisa registro, entrada, guardado y que ninguna cuenta vea datos ajenos. Luego bórralas en Authentication → Users (empiezan con `pruebaescala`).

**Antes de cada clase:** el plan gratuito de Supabase pausa el proyecto tras 7 días sin uso. Entra al panel y, si dice *Paused*, pulsa *Restore*.

**Si alguien olvida con qué nombre se registró:** Authentication → Users. El correo interno es el nombre sin tildes, espacios ni mayúsculas (María José → `mariajose@cuentas.escala.invalid`).

## Dónde cambiar cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Fórmula del precio, meses del flujo, redondeo, % rápidos | `src/config.js` |
| Listas, precios de ejemplo y textos de cada oficio, o agregar un oficio | `src/data/rubros.js` |
| Apartados del lobby, su orden y de qué dependen | `src/lib/apartados.js` |
| Cálculos del plan / de la caja / reglas de nombre y DNI | `src/lib/calc.js`, `src/lib/caja.js`, `src/lib/cuenta.js` |
| Conexión con Supabase (y modo prueba) | `src/almacen.js` |
| Guardado en el celular, sincronización y navegación | `src/negocio.js` |
| Pantallas | `src/pantallas/` (entrada, lobby, apartados, caja) |
| Colores y tamaños | `src/estilos.css` |
