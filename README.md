# ⛽ Sistema Digital de Control y Gestión para Surtidores de Gasolina

Sistema web para el control operativo, gestión de ventas, monitoreo de tanques y emisión de reportes en la estación de servicio **"El Surtidor Cochabambino"**. El proyecto integra ingeniería de software moderna con los principios fundamentales de **Sistemas Digitales** (álgebra de Boole, mapas de Karnaugh y decodificación), implementados directamente como lógica de base de datos (funciones y triggers en PostgreSQL).

**Estado del proyecto: MVP funcional, desplegado en producción.**

---

> ### 🎨 PROTOTIPO / MOCKUP ORIGINAL EN FIGMA
>
> ![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)
>
> 🔗 **[Ver el Prototipo UI/UX en Figma](https://www.figma.com/design/PnQw2kBJtRu8h7GZ2aCwvC/Untitled?node-id=0-1&t=5V9nfK3oPcQpQqwx-1)**
>
> El mockup fue el punto de partida visual; el sistema de diseño final (paleta, tipografía, jerarquía de información) se ajustó durante el desarrollo para mejorar usabilidad — ver sección de decisiones de diseño más abajo.

---

## 🌐 Producción

- **App:** [gestion-calidad-gasolina.vercel.app](https://gestion-calidad-gasolina.vercel.app)
- **Hosting:** Vercel (con `vercel.json` configurado para SPA routing)
- **Backend:** Supabase (Postgres + Auth + Realtime)

---

## 🛠️ Stack Tecnológico

### Frontend & Interfaz
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

### Backend as a Service & Persistencia
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

### Librerías clave
- `recharts` — gráficos del Dashboard y Reportes
- `papaparse` — export CSV
- `jspdf` + `jspdf-autotable` — export PDF
- `react-icons` — iconografía del sidebar

### Calidad & Entorno de Desarrollo
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![oxlint](https://img.shields.io/badge/oxlint-FFCA28?style=for-the-badge&logo=rust&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

> **Nota sobre calidad:** el proyecto usa **oxlint** (linter en Rust, incluido por defecto en templates recientes de Vite) en vez de ESLint tradicional, y **Vitest** para pruebas unitarias — ambos corren en segundos y cubren la capa de lógica (Factory, Adapter). SonarQube/SonarCloud quedó fuera del alcance por tiempo, es un paso opcional de conexión vía OAuth sin tocar código.

---

## 📋 Módulos del Sistema (todos implementados y desplegados)

1. **Autenticación y Roles** — login con Supabase Auth, 3 roles (`admin`, `manager`, `operador`) con permisos diferenciados a nivel de base de datos (RLS) y de interfaz.
2. **Panel Principal (Dashboard)** — vista general de los 4 surtidores, métricas clave (stock, surtidores online, alertas activas), y 2 gráficos analíticos: combustible más vendido y demanda por surtidor.
3. **Gestión de Surtidores** — CRUD de surtidores (alta, recalibración de nivel), con vista de estado en lenguaje humano y detalle técnico (bits de sensor, compuertas lógicas) colapsable.
4. **Punto de Venta (POS)** — selección de surtidor (el combustible y precio se derivan automáticamente, sin selección redundante), teclado numérico, validación de stock disponible, folio de transacción, log de auditoría visual.
5. **Centro de Alertas** — generadas automáticamente por triggers de base de datos ante niveles críticos/bajos. Ciclo de vida completo: `activa` → `reconocida` (En seguimiento) → `resuelta`, con auto-resolución cuando el surtidor vuelve a nivel seguro.
6. **Reportes** — ingresos y litros vendidos por combustible, con selector de rango de fechas (presets + personalizado), gráfica de distribución, y exportación a CSV/PDF.
7. **Auditoría (solo Admin)** — historial de cambios del sistema (`logs_sistema`), filtrable por tabla y buscable por ID de registro. Protegido tanto en la interfaz como por Row Level Security.
8. **Sistema de notificaciones (toasts)** — feedback visual inmediato de éxito/error en cada acción relevante (venta, recalibración, creación de surtidor, gestión de alertas).

---

## 📐 Patrones de Diseño Aplicados

| Tipo | Patrón | Ubicación / Implementación real en el proyecto |
| :--- | :--- | :--- |
| **Creacional** | **Factory Method** | `src/factories/SurtidorFactory.js` — instancia objetos `Surtidor` con reglas (precio, capacidad default) según el tipo de combustible elegido en el modal "Agregar Surtidor". |
| **Estructural** | **Adapter** | `src/adapters/supabaseAdapter.js` — traduce filas crudas de Supabase (`combustible_code`, `nivel_sensor`) a objetos de dominio legibles para la UI (`{combustibleNombre: 'Premium', porcentaje: 12, sensorLabel: 'Bajo'}`). |
| **Comportamiento** | **Observer** | `src/observers/useAlertasRealtime.js` — hook que se suscribe vía `supabase.channel()` a cambios en `surtidores` y `alertas`, notificando a todos los componentes suscritos (Dashboard, Surtidores, Alertas, Header) sin necesidad de refrescar. |

---

## 🗄️ Esquema de Base de Datos (PostgreSQL en Supabase) — real, no simplificado

### Tabla `surtidores`
- `id` (uuid, PK) · `numero` (int, UNIQUE) · `nombre` (text)
- `combustible_code` (varchar(2)) — `00`=Especial, `01`=Premium, `10`=Diésel, `11`=Reserva
- `capacidad_litros`, `nivel_litros` (numeric)
- `nivel_sensor` (varchar(2)) — recalculado automáticamente por trigger
- `estado` (enum: `online`, `offline`, `critico`, `mantenimiento`)
- `led_rojo`, `led_amarillo` (boolean) · `created_at`, `updated_at`

### Tabla `ventas`
- `id` (uuid, PK) · `surtidor_id`, `operador_id` (FK)
- `combustible_code` (varchar(2)) · `litros`, `precio_unitario`, `total` (numeric — calculado por trigger `procesar_venta` como `litros × precio_unitario`)
- `transaccion_ref` (text, ej. `TX-9982A`) · `fecha`

### Tabla `alertas`
- `id` (uuid, PK) · `surtidor_id` (FK)
- `tipo_alerta` (enum: `CRITICO`, `BAJO`, `FALLA`, `TIMEOUT`, `DRIFT`)
- `mensaje` (text, con porcentaje calculado dinámicamente en el frontend a partir del nivel actual)
- `estado` (enum: `activa`, `reconocida`, `resuelta`)
- `led_rojo`, `led_amarillo` (boolean) · `fecha`, `resuelta_at`, `resuelta_por`

### Tabla `logs_sistema` (auditoría)
- `tabla_afectada`, `accion` (`INSERT`/`UPDATE`) · `registro_id`, `usuario_id`
- `detalle` (jsonb) · `hash_verificacion` (sha256, generado con `pgcrypto`) · `created_at`

### Tabla `profiles`
- `id` (FK a `auth.users`) · `nombre` · `rol` (enum: `admin`, `manager`, `operador`)

---

## 🧮 Lógica de Sistemas Digitales (implementada en funciones SQL, no solo documentada)

### 1. Codificación del Sensor de Nivel — `calcular_nivel_sensor()`
Sensor binario de 2 bits (S1 S0), recalculado automáticamente por trigger ante cualquier cambio de `nivel_litros`:

| S1 | S0 | % de llenado | Estado |
| :---: | :---: | :---: | :---: |
| `0` | `0` | 0% – 12.5% | Vacío / Crítico |
| `0` | `1` | 12.5% – 49.9% | Bajo |
| `1` | `0` | 50% – 99.9% | Medio |
| `1` | `1` | 100% | Lleno |

### 2. Compuertas Lógicas para LEDs — `led_rojo_activo()` / `led_amarillo_activo()`

- **LED_Rojo** = `NOT(S1) AND NOT(S0)` → se activa solo en `00`
- **LED_Amarillo** = `NOT(S1) AND S0` → se activa solo en `01`

Ambas funciones están implementadas literalmente en SQL (`sensor = '00'`, `sensor = '01'`) como mapas de Karnaugh ya simplificados.

### 3. Decodificador 2 a 4 líneas — `decode_combustible()`

| C1 | C0 | Salida | Combustible |
| :---: | :---: | :---: | :---: |
| `0` | `0` | Y0 | Gasolina Especial |
| `0` | `1` | Y1 | Gasolina Premium |
| `1` | `0` | Y2 | Diésel |
| `1` | `1` | Y3 | Reserva / No Asignado |

Se muestra también como contenido educativo/estático en el módulo de Reportes (`DecoderTable.jsx`), colapsable para no competir visualmente con las cifras de negocio.

### 4. Cálculo de totales de venta — trigger `procesar_venta()`
El total se calcula como `round(litros × precio_unitario, 2)` en el momento del `INSERT`, y descuenta automáticamente el stock del surtidor correspondiente (`nivel_litros = greatest(nivel_litros - litros, 0)`), lo cual dispara en cascada el recálculo del sensor y, si corresponde, la generación o resolución automática de alertas.

> Nota: a diferencia de una versión anterior de este documento, el cálculo del total **no** usa desplazamiento de bits ni sumadores binarios explícitos — se apoya en la aritmética nativa de PostgreSQL. La lógica digital del proyecto está genuinamente implementada en la capa de *codificación/decodificación de estados* (sensor, LEDs, tipo de combustible), no en el cálculo aritmético de ventas.

---

## 🔒 Seguridad y Roles

Row Level Security (RLS) habilitado en todas las tablas. Diferenciación real de permisos:

| Acción | admin | manager | operador |
| :--- | :---: | :---: | :---: |
| Ver Dashboard, Surtidores, POS, Alertas, Reportes | ✅ | ✅ | ✅ |
| Crear / recalibrar surtidores | ✅ | ✅ | ❌ |
| Ver módulo de Auditoría (`logs_sistema`) | ✅ | ❌ | ❌ |

La protección real vive en las políticas RLS de Postgres (no solo oculta en la interfaz), verificada durante el desarrollo con pruebas cruzadas de rol.

---

## 🚀 Cómo correr el proyecto localmente

```bash
git clone https://github.com/NicoBA-Dev/gestion-calidad-gasolina.git
cd gestion-calidad-gasolina
npm install
```

Crear `.env.local` en la raíz:
```
VITE_SUPABASE_URL=tu_project_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

Ejecutar `schema_el_surtidor.sql` completo en el SQL Editor de un proyecto Supabase nuevo, luego:

```bash
npm run dev      # desarrollo local
npm run test     # pruebas unitarias (Vitest)
npx oxlint src   # análisis estático
npm run build    # build de producción
```

---

## 📦 Fuera de alcance del MVP (documentado como decisión, no como omisión)

- Integración con hardware real de surtidores/sensores
- Facturación fiscal electrónica (SIN Bolivia)
- Multi-sucursal, app móvil nativa
- Notificaciones push/SMS para logística de reabastecimiento
- Cierre de caja / arqueo de turno
- SonarCloud (listo para conectar, no ejecutado por tiempo)