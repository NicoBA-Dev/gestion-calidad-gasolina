# ⛽ Sistema Digital de Control y Gestión para Surtidores de Gasolina

Sistema web multiplataforma para el control operativo, gestión de ventas, monitoreo de tanques y emisión de reportes en la estación de servicio **"El Surtidor Cochabambino"**. El proyecto integra ingeniería de software moderna con los principios fundamentales de **Sistemas Digitales** (álgebra de Boole, mapas de Karnaugh, aritmética binaria y decodificación).

---

## 🛠️ Stack Tecnológico

### Frontend & Interfaz
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Backend as a Service & Persistencia
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

### Calidad & Entorno de Desarrollo
![CachyOS](https://img.shields.io/badge/CachyOS-10B981?style=for-the-badge&logo=arch-linux&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![SonarQube](https://img.shields.io/badge/SonarQube-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white)

---

## 📋 Módulos del Sistema

1. **Gestión de Surtidores:** CRUD de surtidores, tipo de combustible, capacidad total y monitoreo de niveles.
2. **Punto de Venta (POS):** Registro de transacciones con cálculo de totales basados en aritmética binaria.
3. **Panel de Alertas en Tiempo Real:** Indicadores luminosos (LEDs) activados por lógica booleana según el estado de los tanques.
4. **Reportes & Estadísticas:** Desglose de ingresos e inventario mediante decodificadores de combustible.

---

## 📐 Patrones de Diseño Aplicados

Para mantener una arquitectura limpia y modular en el frontend, se implementan tres patrones de diseño principales:

| Tipo | Patrón | Ubicación / Implementación en el Proyecto |
| :--- | :--- | :--- |
| **Creacional** | **Factory Method** | Instanciación dinámica de objetos `Surtidor` y lecturas de sensores según el tipo de combustible. |
| **Estructural** | **Adapter** | Normaliza los datos provenientes de la API de Supabase adaptándolos a registros binarios consumibles por la UI. |
| **Comportamiento** | **Observer** | Suscripción en tiempo real (*Supabase Realtime*) para el monitoreo contínuo de alertas y disparo de eventos visuales. |

---

# 🔬 ESPECIFICACIONES TÉCNICAS Y LÓGICA DIGITAL

---

## 🗄️ Esquema de Base de Datos (PostgreSQL en Supabase)

### Tabla `surtidores`
- `id` (uuid, PK)
- `numero` (int, UNIQUE)
- `combustible_code` (varchar(2)) — Código binario (`00`, `01`, `10`)
- `capacidad_litros` (decimal)
- `nivel_sensor` (varchar(2)) — Código binario del sensor (`00`, `01`, `10`, `11`)
- `created_at` (timestamp)

### Tabla `ventas`
- `id` (uuid, PK)
- `surtidor_id` (uuid, FK -> `surtidores.id`)
- `combustible_code` (varchar(2))
- `litros` (decimal)
- `precio_unitario` (decimal)
- `total_calculado_binario` (decimal)
- `fecha` (timestamp)

### Tabla `alertas`
- `id` (uuid, PK)
- `surtidor_id` (uuid, FK -> `surtidores.id`)
- `tipo_alerta` (varchar) — `CRITICO` / `BAJO` / `NORMAL`
- `led_rojo` (boolean)
- `led_amarillo` (boolean)
- `fecha` (timestamp)

---

## 🧮 Lógica de Sistemas Digitales

### 1. Codificación del Sensor de Nivel
El nivel de combustible dentro del tanque es enviado por un sensor binario de 2 bits ($S_1 S_0$):

| $S_1$ | $S_0$ | Nivel de Combustible | Estado del Tanque |
| :---: | :---: | :---: | :---: |
| `0` | `0` | $0\%$ | Vacío (Crítico) |
| `0` | `1` | $25\%$ | Bajo |
| `1` | `0` | $50\%$ | Medio |
| `1` | `1` | $100\%$ | Lleno |

---

### 2. Tablas de Verdad, Mapas de Karnaugh y Compuertas Lógicas

#### A. Alerta Crítica ($LED_{Rojo}$)
Se activa **únicamente** cuando el nivel es $0\%$ ($S_1=0, S_0=0$).

* **Tabla de Verdad:**
  * $S_1=0, S_0=0 \rightarrow LED_{Rojo} = 1$
  * $S_1=0, S_0=1 \rightarrow LED_{Rojo} = 0$
  * $S_1=1, S_0=0 \rightarrow LED_{Rojo} = 0$
  * $S_1=1, S_0=1 \rightarrow LED_{Rojo} = 0$

* **Ecuación Booleana Simplificada:**
  $$LED_{Rojo} = \overline{S_1} \cdot \overline{S_0}$$
  *(Implementación con compuertas NOR / AND con entradas invertidas)*

#### B. Alerta de Nivel Bajo ($LED_{Amarillo}$)
Se activa cuando el nivel es $25\%$ ($S_1=0, S_0=1$).

* **Tabla de Verdad:**
  * $S_1=0, S_0=0 \rightarrow LED_{Amarillo} = 0$
  * $S_1=0, S_0=1 \rightarrow LED_{Amarillo} = 1$
  * $S_1=1, S_0=0 \rightarrow LED_{Amarillo} = 0$
  * $S_1=1, S_0=1 \rightarrow LED_{Amarillo} = 0$

* **Ecuación Booleana Simplificada:**
  $$LED_{Amarillo} = \overline{S_1} \cdot S_0$$

---

### 3. Decodificador de Tipos de Combustible
Decodificador de 2 a 4 líneas para identificar la línea de producto en reportes y surtidores:

| $C_1$ | $C_0$ | Salida Decodificada | Tipo de Combustible |
| :---: | :---: | :---: | :---: |
| `0` | `0` | $Y_0$ | Gasolina Especial |
| `0` | `1` | $Y_1$ | Gasolina Premium |
| `1` | `0` | $Y_2$ | Diésel |
| `1` | `1` | $Y_3$ | Reserva / No Asignado |

* **Ecuaciones del Decodificador:**
  * $Y_0 = \overline{C_1} \cdot \overline{C_0}$
  * $Y_1 = \overline{C_1} \cdot C_0$
  * $Y_2 = C_1 \cdot \overline{C_0}$
  * $Y_3 = C_1 \cdot C_0$

---

### 4. Aritmética Binaria para Cálculo de Ventas
El cálculo de totales de venta se valida mediante operaciones a nivel de bits (*bitwise arithmetic*) sumando multiplicaciones sucesivas de desplazamientos de bits (*bit-shift operations*):
* Multiplicación mediante desplazamientos a la izquierda (`<<`) y sumadores binarios completos (*Full Adders*).

---

## 🚀 Instalación y Configuración Local

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/tu-usuario/gestion-surtidor-gasolina.git](https://github.com/tu-usuario/gestion-surtidor-gasolina.git)
   cd gestion-surtidor-gasolina
