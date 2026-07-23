import { describe, it, expect } from 'vitest'
import { adaptSurtidor, adaptAlerta } from './supabaseAdapter'

describe('adaptSurtidor', () => {
  it('traduce combustible_code y calcula porcentaje', () => {
    const row = {
      id: '1', numero: 1, nombre: 'Surtidor 01',
      combustible_code: '01', capacidad_litros: 10000, nivel_litros: 2500,
      nivel_sensor: '01', estado: 'online', led_rojo: false, led_amarillo: true,
    }
    const result = adaptSurtidor(row)
    expect(result.combustibleNombre).toBe('Premium')
    expect(result.porcentaje).toBe(25)
    expect(result.sensorLabel).toBe('Bajo')
  })

  it('maneja capacidad cero sin dividir por cero', () => {
    const row = {
      id: '2', numero: 2, nombre: 'X', combustible_code: '00',
      capacidad_litros: 0, nivel_litros: 0, nivel_sensor: '00',
      estado: 'offline', led_rojo: false, led_amarillo: false,
    }
    expect(adaptSurtidor(row).porcentaje).toBe(0)
  })
})

describe('adaptAlerta', () => {
  it('mapea los campos de la vista v_alertas_activas', () => {
    const row = {
      id: 'a1', tipo_alerta: 'CRITICO', mensaje: 'Test',
      led_rojo: true, led_amarillo: false, fecha: '2026-01-01',
      surtidor_numero: 2, surtidor_nombre: 'Surtidor 02',
    }
    const result = adaptAlerta(row)
    expect(result.tipo).toBe('CRITICO')
    expect(result.surtidorNumero).toBe(2)
  })
})