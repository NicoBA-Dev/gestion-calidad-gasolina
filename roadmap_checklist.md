# Roadmap MVP — El Surtidor Cochabambino
Stack: React + Vite + Tailwind · Supabase (Postgres/Auth/Realtime) como BaaS · Vercel

---

## FASE 0 — Setup Supabase (base de todo)
- [ ] Crear proyecto en Supabase
- [ ] Ejecutar `schema_el_surtidor.sql` completo en SQL Editor
- [ ] Verificar en Table Editor que existan: `profiles`, `surtidores`, `ventas`, `alertas`, `logs_sistema`
- [ ] Verificar que las vistas `v_surtidores_dashboard`, `v_reporte_por_combustible`, `v_alertas_activas` existan
- [ ] Confirmar que Realtime está activo en `surtidores` y `alertas` (Database > Replication)
- [ ] Crear un usuario de prueba desde Authentication > Users
- [ ] Ir a `profiles` y cambiarle el rol a `admin` manualmente (para poder probar todo)
- [ ] Copiar `SUPABASE_URL` y `SUPABASE_ANON_KEY` para el `.env` del frontend

## FASE 1 — Setup del proyecto React
- [ ] `npm create vite@latest el-surtidor -- --template react`
- [ ] Instalar Tailwind (`tailwindcss`, `postcss`, `autoprefixer`)
- [ ] Instalar `@supabase/supabase-js`
- [ ] Instalar `recharts` (o `chart.js`) para las gráficas de Reportes
- [ ] Crear estructura de carpetas:
  ```
  src/
    lib/supabaseClient.js
    adapters/          <- patrón Adapter (normaliza datos de Supabase)
    factories/         <- patrón Factory (crea instancias de Surtidor)
    observers/          <- patrón Observer (suscripciones Realtime)
    pages/
      Dashboard.jsx
      Dispensers.jsx
      POS.jsx
      Alerts.jsx
      Reports.jsx
    components/
    hooks/
  ```
- [ ] Configurar variables de entorno (`.env.local`) con las keys de Supabase
- [ ] Subir a GitHub (repo ya existe: gestion-calidad-gasolina)

## FASE 2 — Autenticación
- [ ] Pantalla de login (email/password con `supabase.auth.signInWithPassword`)
- [ ] Guardar sesión en contexto React (`AuthContext`)
- [ ] Traer el `profile` (rol) del usuario logueado tras el login
- [ ] Rutas protegidas (redirigir a login si no hay sesión)

## FASE 3 — Patrones de diseño (capa de lógica)
- [ ] **Factory**: función/clase `SurtidorFactory.crear(tipoCombustible, capacidad)` que instancia objetos `Surtidor` con sus reglas según `combustible_code`
- [ ] **Adapter**: módulo `supabaseAdapter.js` que traduce filas crudas de Supabase (`combustible_code`, `nivel_sensor`) a objetos de dominio legibles para la UI (`{nombre: 'Premium', porcentaje: 12}`)
- [ ] **Observer**: hook `useAlertasRealtime()` que se suscribe con `supabase.channel(...)` a cambios en `alertas` y `surtidores`, y notifica a los componentes suscritos (Dashboard, Alerts Center)

## FASE 4 — CRUD Surtidores (Dispensers Management)
- [ ] Listar surtidores (usa `v_surtidores_dashboard`)
- [ ] Crear surtidor nuevo (modal "+ Add New Dispenser")
- [ ] Editar surtidor (capacidad, nombre)
- [ ] "Recalibrate" → actualiza `nivel_litros` manualmente (simulación de calibración)
- [ ] Mostrar barra de progreso de tanque + bits del sensor (`nivel_sensor`)
- [ ] Mostrar LEDs (rojo/amarillo) leyendo `led_rojo` / `led_amarillo` en vivo (Realtime)

## FASE 5 — POS (Registro de Ventas)
- [ ] Selector de surtidor (P1-P4)
- [ ] Selector de tipo de combustible con su `combustible_code` y precio
- [ ] Teclado numérico para litros
- [ ] Cálculo de total (lo hace el trigger `procesar_venta`, pero mostrar preview en el front también)
- [ ] Botón "Confirm & Dispense" → `insert` en `ventas`
- [ ] Panel de "Sale Summary" con folio de transacción (`transaccion_ref`)
- [ ] (Opcional MVP+) Mini log visual tipo "SYSTEM AUDIT LOG" leyendo de `logs_sistema` filtrado por esa venta

## FASE 6 — Alerts Center
- [ ] Listar alertas activas (usa `v_alertas_activas`)
- [ ] Filtros: Todas / Críticas / Warnings
- [ ] Botón "Ack" → `update alertas set estado = 'reconocida'`
- [ ] Botón "Dispatch" (MVP: solo marca la alerta con una nota, sin integración real de logística)
- [ ] Contador de "Unresolved Alerts" en tiempo real (Realtime)

## FASE 7 — Reportes
- [ ] Selector de rango de fechas
- [ ] Tarjetas por combustible usando `v_reporte_por_combustible` (Especial/Premium/Diésel)
- [ ] Gráfica de barras "Volume Distribution" (recharts)
- [ ] Tabla del "2-to-4 Line Decoder" (mostrar la lógica C1,C0 → Y0-Y3 como en el mockup, es contenido educativo/estático)
- [ ] Export CSV (fácil: `Papa.unparse` + descarga blob)
- [ ] Export PDF (opcional MVP+, usar `jsPDF` o dejarlo para v2)

## FASE 8 — Calidad
- [ ] Configurar Vitest + pruebas unitarias mínimas:
  - [ ] Factory de surtidores
  - [ ] Funciones de decodificación (si se replican en el front)
  - [ ] Adapter de datos
- [ ] Configurar SonarQube (o SonarCloud, más simple para MVP)
- [ ] Linter (ESLint) configurado desde el inicio

## FASE 9 — Deploy
- [ ] Conectar repo de GitHub a Vercel
- [ ] Configurar variables de entorno en Vercel (Supabase URL/Key)
- [ ] Deploy y prueba end-to-end en producción
- [ ] Configurar dominio (opcional)

---

## Cosas que quedan **fuera del alcance del MVP** (para no perder tiempo ahí)
- Integración con hardware real de surtidores/sensores
- Facturación fiscal electrónica (SIN Bolivia)
- Multi-sucursal
- App móvil nativa
- Notificaciones push/SMS reales para "Dispatch" de camión cisterna
- Cierre de caja / arqueo de turno

Estas se pueden agregar como "Fase 10 - v2" si el proyecto crece después de la entrega del MVP.
