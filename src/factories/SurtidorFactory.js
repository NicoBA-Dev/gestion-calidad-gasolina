const REGLAS_COMBUSTIBLE = {
  especial: { code: '00', precioDefault: 3.74, capacidadDefault: 10000 },
  premium: { code: '01', precioDefault: 4.79, capacidadDefault: 10000 },
  diesel: { code: '10', precioDefault: 3.72, capacidadDefault: 10000 },
}

export class SurtidorFactory {
  static crear(tipoCombustible, { numero, nombre, capacidad } = {}) {
    const reglas = REGLAS_COMBUSTIBLE[tipoCombustible]
    if (!reglas) {
      throw new Error(`Tipo de combustible desconocido: ${tipoCombustible}`)
    }

    return {
      numero,
      nombre: nombre || `Surtidor ${String(numero).padStart(2, '0')}`,
      combustible_code: reglas.code,
      capacidad_litros: capacidad || reglas.capacidadDefault,
      nivel_litros: 0,
    }
  }

  static tiposDisponibles() {
    return Object.keys(REGLAS_COMBUSTIBLE)
  }

  static precioDefault(tipoCombustible) {
    return REGLAS_COMBUSTIBLE[tipoCombustible]?.precioDefault ?? 0
  }
}