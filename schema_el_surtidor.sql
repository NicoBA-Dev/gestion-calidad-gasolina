-- ============================================================================
-- EL SURTIDOR COCHABAMBINO — Esquema de Base de Datos (Supabase / PostgreSQL)
-- ============================================================================
-- Ejecutar completo en: Supabase Dashboard > SQL Editor > New Query > Run
-- Este script es idempotente (usa IF NOT EXISTS / CREATE OR REPLACE) para
-- poder re-ejecutarlo sin romper nada si ya corriste una parte antes.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 0. EXTENSIONES
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- para gen_random_uuid()


-- ----------------------------------------------------------------------------
-- 1. TIPOS ENUM (mejor que varchar libre para estados controlados)
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'rol_usuario') then
    create type rol_usuario as enum ('admin', 'manager', 'operador');
  end if;

  if not exists (select 1 from pg_type where typname = 'estado_surtidor') then
    create type estado_surtidor as enum ('online', 'offline', 'critico', 'mantenimiento');
  end if;

  if not exists (select 1 from pg_type where typname = 'estado_alerta') then
    create type estado_alerta as enum ('activa', 'reconocida', 'resuelta');
  end if;

  if not exists (select 1 from pg_type where typname = 'tipo_alerta') then
    create type tipo_alerta as enum ('CRITICO', 'BAJO', 'FALLA', 'TIMEOUT', 'DRIFT');
  end if;
end $$;


-- ----------------------------------------------------------------------------
-- 2. TABLA: profiles
-- Extiende auth.users de Supabase con rol y nombre. Se crea automáticamente
-- cuando alguien se registra (ver trigger al final).
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text not null,
  rol         rol_usuario not null default 'operador',
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Usuarios del sistema (Admin/Manager/Operador) ligados a auth.users';


-- ----------------------------------------------------------------------------
-- 3. TABLA: surtidores
-- combustible_code y nivel_sensor se guardan como varchar(2) para reflejar
-- literalmente los 2 bits (S1 S0 / C1 C0) que pide la lógica digital.
-- ----------------------------------------------------------------------------
create table if not exists public.surtidores (
  id                 uuid primary key default gen_random_uuid(),
  numero             int not null unique,
  nombre             text not null,                    -- ej. "Surtidor 01"
  combustible_code   varchar(2) not null                -- 00, 01, 10 (ver decodificador)
                       check (combustible_code in ('00','01','10','11')),
  capacidad_litros   numeric(10,2) not null check (capacidad_litros > 0),
  nivel_litros       numeric(10,2) not null default 0
                       check (nivel_litros >= 0),
  nivel_sensor       varchar(2) not null default '00'   -- S1 S0, se recalcula por trigger
                       check (nivel_sensor in ('00','01','10','11')),
  estado             estado_surtidor not null default 'online',
  led_rojo           boolean not null default false,
  led_amarillo       boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.surtidores is 'Surtidores/dispensers físicos de la estación';
comment on column public.surtidores.combustible_code is '00=Especial(Y0) 01=Premium(Y1) 10=Diesel(Y2) 11=Reserva(Y3)';
comment on column public.surtidores.nivel_sensor is 'S1S0: 00=Vacio(0%) 01=Bajo(25%) 10=Medio(50%) 11=Lleno(100%)';


-- ----------------------------------------------------------------------------
-- 4. TABLA: ventas
-- ----------------------------------------------------------------------------
create table if not exists public.ventas (
  id                  uuid primary key default gen_random_uuid(),
  surtidor_id         uuid not null references public.surtidores(id) on delete restrict,
  operador_id         uuid references public.profiles(id) on delete set null,
  combustible_code    varchar(2) not null check (combustible_code in ('00','01','10','11')),
  litros              numeric(10,2) not null check (litros > 0),
  precio_unitario     numeric(10,2) not null check (precio_unitario > 0),
  total               numeric(12,2) not null,           -- se calcula por trigger (litros * precio)
  transaccion_ref     text,                              -- ej. "TX-9982A" visible en el POS
  fecha               timestamptz not null default now()
);

comment on table public.ventas is 'Transacciones registradas desde el POS';


-- ----------------------------------------------------------------------------
-- 5. TABLA: alertas
-- ----------------------------------------------------------------------------
create table if not exists public.alertas (
  id            uuid primary key default gen_random_uuid(),
  surtidor_id   uuid not null references public.surtidores(id) on delete cascade,
  tipo_alerta   tipo_alerta not null,
  mensaje       text not null,
  led_rojo      boolean not null default false,
  led_amarillo  boolean not null default false,
  estado        estado_alerta not null default 'activa',
  fecha         timestamptz not null default now(),
  resuelta_at   timestamptz,
  resuelta_por  uuid references public.profiles(id) on delete set null
);

comment on table public.alertas is 'Alertas generadas por la lógica booleana del sistema (Observer pattern)';


-- ----------------------------------------------------------------------------
-- 6. TABLA: logs_sistema (auditoría)
-- Cubre el "SYSTEM AUDIT LOG" que se ve en el mockup del POS.
-- ----------------------------------------------------------------------------
create table if not exists public.logs_sistema (
  id              uuid primary key default gen_random_uuid(),
  tabla_afectada  text not null,
  accion          text not null,          -- INSERT / UPDATE / DELETE
  registro_id     uuid,
  usuario_id      uuid references public.profiles(id) on delete set null,
  detalle         jsonb,
  hash_verificacion text,                  -- equivalente simulado al "HASH_OK" del mockup
  created_at      timestamptz not null default now()
);

comment on table public.logs_sistema is 'Auditoría de cambios sobre surtidores, ventas y alertas';


-- ============================================================================
-- 7. FUNCIONES: LÓGICA DIGITAL (decodificador, K-map, aritmética)
-- ============================================================================

-- 7.1 Decodificador 2-a-4 líneas: combustible_code -> nombre legible
create or replace function public.decode_combustible(code varchar(2))
returns text
language sql
immutable
as $$
  select case code
    when '00' then 'Gasolina Especial'
    when '01' then 'Gasolina Premium'
    when '10' then 'Diesel'
    when '11' then 'Reserva / No Asignado'
    else 'Desconocido'
  end;
$$;

-- 7.2 Calcula S1 S0 (nivel_sensor) a partir de % de llenado
--     0-12.4% -> 00 (vacio) | 12.5-49.9% -> 01 (bajo) | 50-99.9% -> 10 (medio) | 100% -> 11 (lleno)
create or replace function public.calcular_nivel_sensor(litros numeric, capacidad numeric)
returns varchar(2)
language plpgsql
immutable
as $$
declare
  pct numeric;
begin
  if capacidad = 0 then
    return '00';
  end if;
  pct := (litros / capacidad) * 100;
  if pct <= 12.5 then
    return '00';
  elsif pct < 50 then
    return '01';
  elsif pct < 100 then
    return '10';
  else
    return '11';
  end if;
end;
$$;

-- 7.3 Mapa de Karnaugh simplificado: LED_Rojo = NOT(S1) AND NOT(S0)
create or replace function public.led_rojo_activo(sensor varchar(2))
returns boolean
language sql
immutable
as $$
  select sensor = '00';
$$;

-- 7.4 Mapa de Karnaugh simplificado: LED_Amarillo = NOT(S1) AND S0
create or replace function public.led_amarillo_activo(sensor varchar(2))
returns boolean
language sql
immutable
as $$
  select sensor = '01';
$$;


-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

-- 8.1 updated_at automático en surtidores
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_surtidores_updated_at on public.surtidores;
create trigger trg_surtidores_updated_at
  before update on public.surtidores
  for each row execute function public.set_updated_at();


-- 8.2 Recalcula nivel_sensor + LEDs cada vez que cambia nivel_litros o capacidad
--     Esto es el corazón de la lógica digital: el sensor "lee" el tanque.
create or replace function public.recalcular_sensor_surtidor()
returns trigger
language plpgsql
as $$
begin
  new.nivel_sensor := public.calcular_nivel_sensor(new.nivel_litros, new.capacidad_litros);
  new.led_rojo      := public.led_rojo_activo(new.nivel_sensor);
  new.led_amarillo  := public.led_amarillo_activo(new.nivel_sensor);

  -- estado operativo derivado del sensor
  if new.led_rojo then
    new.estado := 'critico';
  elsif new.estado = 'critico' then
    new.estado := 'online'; -- se recupera si ya no está en 0%
  end if;

  return new;
end;
$$;

drop trigger if exists trg_recalcular_sensor on public.surtidores;
create trigger trg_recalcular_sensor
  before insert or update of nivel_litros, capacidad_litros on public.surtidores
  for each row execute function public.recalcular_sensor_surtidor();


-- 8.3 Genera una alerta automáticamente cuando un surtidor entra en estado
--     crítico o bajo (patrón Observer -> Supabase Realtime dispara el LED en el UI)
create or replace function public.generar_alerta_por_sensor()
returns trigger
language plpgsql
as $$
begin
  if new.led_rojo and (old is null or old.led_rojo is distinct from new.led_rojo) then
    insert into public.alertas (surtidor_id, tipo_alerta, mensaje, led_rojo, led_amarillo)
    values (new.id, 'CRITICO', 'Nivel de tanque en 0% - ' || new.nombre, true, false);
  elsif new.led_amarillo and (old is null or old.led_amarillo is distinct from new.led_amarillo) then
    insert into public.alertas (surtidor_id, tipo_alerta, mensaje, led_rojo, led_amarillo)
    values (new.id, 'BAJO', 'Nivel de tanque bajo (25%) - ' || new.nombre, false, true);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_generar_alerta on public.surtidores;
create trigger trg_generar_alerta
  after insert or update of led_rojo, led_amarillo on public.surtidores
  for each row execute function public.generar_alerta_por_sensor();


-- 8.4 Calcula el total de la venta (litros * precio_unitario) y descuenta
--     del tanque del surtidor correspondiente
create or replace function public.procesar_venta()
returns trigger
language plpgsql
as $$
begin
  new.total := round(new.litros * new.precio_unitario, 2);

  update public.surtidores
     set nivel_litros = greatest(nivel_litros - new.litros, 0)
   where id = new.surtidor_id;

  return new;
end;
$$;

drop trigger if exists trg_procesar_venta on public.ventas;
create trigger trg_procesar_venta
  before insert on public.ventas
  for each row execute function public.procesar_venta();


-- 8.5 Auditoría genérica: registra INSERT/UPDATE en surtidores, ventas y alertas
create or replace function public.log_cambios()
returns trigger
language plpgsql
as $$
begin
  insert into public.logs_sistema (tabla_afectada, accion, registro_id, detalle, hash_verificacion)
  values (
    tg_table_name,
    tg_op,
    coalesce(new.id, old.id),
    to_jsonb(new),
    encode(digest(coalesce(new.id, old.id)::text || tg_table_name || now()::text, 'sha256'), 'hex')
  );
  return new;
end;
$$;

-- requiere pgcrypto para digest()
drop trigger if exists trg_log_surtidores on public.surtidores;
create trigger trg_log_surtidores
  after insert or update on public.surtidores
  for each row execute function public.log_cambios();

drop trigger if exists trg_log_ventas on public.ventas;
create trigger trg_log_ventas
  after insert on public.ventas
  for each row execute function public.log_cambios();

drop trigger if exists trg_log_alertas on public.alertas;
create trigger trg_log_alertas
  after insert or update on public.alertas
  for each row execute function public.log_cambios();


-- 8.6 Crea automáticamente un profile cuando alguien se registra en Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, rol)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', new.email), 'operador');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================================
-- 9. VISTAS ÚTILES PARA EL DASHBOARD / REPORTES
-- ============================================================================

-- 9.1 Dashboard: surtidores con % de llenado y nombre de combustible decodificado
create or replace view public.v_surtidores_dashboard as
select
  s.id,
  s.numero,
  s.nombre,
  s.combustible_code,
  public.decode_combustible(s.combustible_code) as combustible_nombre,
  s.capacidad_litros,
  s.nivel_litros,
  round((s.nivel_litros / nullif(s.capacidad_litros,0)) * 100, 1) as porcentaje_llenado,
  s.nivel_sensor,
  s.estado,
  s.led_rojo,
  s.led_amarillo
from public.surtidores s;

-- 9.2 Reportes: ventas por tipo de combustible (equivalente a Y0/Y1/Y2 del reporte)
create or replace view public.v_reporte_por_combustible as
select
  v.combustible_code,
  public.decode_combustible(v.combustible_code) as combustible_nombre,
  count(*)              as num_transacciones,
  sum(v.litros)          as total_litros,
  sum(v.total)           as total_ingresos
from public.ventas v
group by v.combustible_code;

-- 9.3 Alertas activas (para el Alerts Center)
create or replace view public.v_alertas_activas as
select
  a.id,
  a.tipo_alerta,
  a.mensaje,
  a.led_rojo,
  a.led_amarillo,
  a.fecha,
  s.numero as surtidor_numero,
  s.nombre as surtidor_nombre
from public.alertas a
join public.surtidores s on s.id = a.surtidor_id
where a.estado = 'activa'
order by a.fecha desc;


-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) — básico para MVP
-- ============================================================================
alter table public.profiles     enable row level security;
alter table public.surtidores   enable row level security;
alter table public.ventas       enable row level security;
alter table public.alertas      enable row level security;
alter table public.logs_sistema enable row level security;

-- Cualquier usuario autenticado puede LEER todo (dashboard, reportes)
drop policy if exists "lectura autenticados" on public.surtidores;
create policy "lectura autenticados" on public.surtidores
  for select using (auth.role() = 'authenticated');

drop policy if exists "lectura autenticados" on public.ventas;
create policy "lectura autenticados" on public.ventas
  for select using (auth.role() = 'authenticated');

drop policy if exists "lectura autenticados" on public.alertas;
create policy "lectura autenticados" on public.alertas
  for select using (auth.role() = 'authenticated');

drop policy if exists "lectura propio perfil" on public.profiles;
create policy "lectura propio perfil" on public.profiles
  for select using (auth.uid() = id);

-- Operadores y managers pueden INSERTAR ventas
drop policy if exists "insertar ventas autenticados" on public.ventas;
create policy "insertar ventas autenticados" on public.ventas
  for insert with check (auth.role() = 'authenticated');

-- Solo manager/admin pueden modificar surtidores (crear/editar/recalibrar)
drop policy if exists "editar surtidores manager" on public.surtidores;
create policy "editar surtidores manager" on public.surtidores
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.rol in ('admin','manager')
    )
  );

drop policy if exists "crear surtidores manager" on public.surtidores;
create policy "crear surtidores manager" on public.surtidores
  for insert with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.rol in ('admin','manager')
    )
  );

-- Reconocer/resolver alertas: cualquier autenticado (operador puede hacer "Ack")
drop policy if exists "actualizar alertas autenticados" on public.alertas;
create policy "actualizar alertas autenticados" on public.alertas
  for update using (auth.role() = 'authenticated');

-- logs_sistema: solo lectura para admin (nadie inserta manualmente, lo hacen los triggers)
drop policy if exists "logs solo admin" on public.logs_sistema;
create policy "logs solo admin" on public.logs_sistema
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.rol = 'admin'
    )
  );


-- ============================================================================
-- 11. HABILITAR REALTIME (para el patrón Observer en el frontend)
-- ============================================================================
alter publication supabase_realtime add table public.surtidores;
alter publication supabase_realtime add table public.alertas;


-- ============================================================================
-- 12. DATOS SEMILLA (seed) — opcional, para probar el MVP de inmediato
-- ============================================================================
insert into public.surtidores (numero, nombre, combustible_code, capacidad_litros, nivel_litros)
values
  (1, 'Surtidor 01', '00', 10000, 8450),
  (2, 'Surtidor 02', '01', 10000, 1200),
  (3, 'Surtidor 03', '10', 10000, 2500),
  (4, 'Surtidor 04', '00', 10000, 5000)
on conflict (numero) do nothing;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
