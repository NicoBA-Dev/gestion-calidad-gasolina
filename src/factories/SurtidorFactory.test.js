import { describe, it, expect } from 'vitest'
import { SurtidorFactory } from './SurtidorFactory'

describe('SurtidorFactory', () => {
  it('crea un surtidor especial con valores default', () => {
    const s = SurtidorFactory.crear('especial', { numero: 5 })
    expect(s.combustible_code).toBe('00')
    expect(s.capacidad_litros).toBe(10000)
    expect(s.nivel_litros).toBe(0)
    expect(s.nombre).toBe('Surtidor 05')
  })

  it('respeta capacidad y nombre personalizados', () => {
    const s = SurtidorFactory.crear('diesel', { numero: 9, nombre: 'Tanque Norte', capacidad: 5000 })
    expect(s.combustible_code).toBe('10')
    expect(s.capacidad_litros).toBe(5000)
    expect(s.nombre).toBe('Tanque Norte')
  })

  it('lanza error con tipo de combustible desconocido', () => {
    expect(() => SurtidorFactory.crear('gasnatural', { numero: 1 })).toThrow()
  })

  it('devuelve el precio default correcto', () => {
    expect(SurtidorFactory.precioDefault('premium')).toBe(4.79)
  })
})