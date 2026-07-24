const COMBUSTIBLE_MAP = {
  '00': { nombre: 'Especial', color: 'black', precioDefault: 3.74 },
  '01': { nombre: 'Premium', color: 'brand-red', precioDefault: 4.79 },
  '10': { nombre: 'Diésel', color: 'slate', precioDefault: 3.72 },
  '11': { nombre: 'Reserva', color: 'gray', precioDefault: 0 },
}

const SENSOR_MAP = {
  '00': { label: 'Vacío', pctReferencia: 0 },
  '01': { label: 'Bajo', pctReferencia: 25 },
  '10': { label: 'Medio', pctReferencia: 50 },
  '11': { label: 'Lleno', pctReferencia: 100 },
}

export function adaptSurtidor(row) {
  const combustible = COMBUSTIBLE_MAP[row.combustible_code] ?? COMBUSTIBLE_MAP['11']
  const sensor = SENSOR_MAP[row.nivel_sensor] ?? SENSOR_MAP['00']
  const porcentaje = row.capacidad_litros
    ? Math.round((row.nivel_litros / row.capacidad_litros) * 100)
    : 0

  return {
    id: row.id,
    numero: row.numero,
    nombre: row.nombre,
    combustibleCode: row.combustible_code,
    combustibleNombre: combustible.nombre,
    combustibleColor: combustible.color,
    capacidadLitros: row.capacidad_litros,
    nivelLitros: row.nivel_litros,
    porcentaje,
    sensorBits: row.nivel_sensor,
    sensorLabel: sensor.label,
    estado: row.estado,
    ledRojo: row.led_rojo,
    ledAmarillo: row.led_amarillo,
  }
}

export function adaptSurtidores(rows) {
  return rows.map(adaptSurtidor)
}

export function adaptAlerta(row) {
  return {
    id: row.id,
    tipo: row.tipo_alerta,
    mensaje: row.mensaje,
    ledRojo: row.led_rojo,
    ledAmarillo: row.led_amarillo,
    estado: row.estado,
    fecha: row.fecha,
    surtidorNumero: row.surtidor_numero,
    surtidorNombre: row.surtidor_nombre,
  }
}

export function adaptLog(row) {
  return {
    id: row.id,
    tabla: row.tabla_afectada,
    accion: row.accion,
    registroId: row.registro_id,
    detalle: row.detalle,
    hash: row.hash_verificacion,
    fecha: row.created_at,
  }
}
export function adaptLogs(rows) {
  return rows.map(adaptLog)
}

export function adaptAlertas(rows) {
  return rows.map(adaptAlerta)
}