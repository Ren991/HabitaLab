// src/lib/calculatorEngine.ts

export type TipoIndice = 'IPC' | 'ICL';
export type FrecuenciaAjuste = 3 | 4; // Trimestral o Cuatrimestral
export type DuracionContrato = 3 | 6 | 12 | 18 | 24 | 32;

export interface ServicioItem {
  id: string;
  nombre: string;
  monto: number;
  aumentoMensualEst: number; // Porcentaje
  activo: boolean;
}

export interface ConfigExpensas {
  activo: boolean;
  montoInicial: number;
  aumentoMensualEst: number;
}

export interface ParametrosCalculo {
  alquilerInicial: number;
  duracionMeses: DuracionContrato;
  frecuenciaAjuste: FrecuenciaAjuste;
  indice: TipoIndice;
  
  // Estrategia de inflación/aumento
  usarPromedioHistorico: boolean;
  tasaManualMensual: number; // Si usarPromedioHistorico === false
  promedioCalculadoArgly: number; // Tasa promedio obtenida de Argly
  
  // Servicios & Expensas opcionales
  incluirServicios: boolean;
  servicios: ServicioItem[];
  
  incluirExpensas: boolean;
  expensas: ConfigExpensas;
}

export interface DetalleMes {
  numeroMes: number;
  montoAlquiler: number;
  montoExpensas: number;
  desgloseServicios: Record<string, number>;
  totalServicios: number;
  costoTotalMes: number;
  esMesDeAjuste: boolean;
}

export function calcularProyeccionContrato(params: ParametrosCalculo): DetalleMes[] {
  const {
    alquilerInicial,
    duracionMeses,
    frecuenciaAjuste,
    usarPromedioHistorico,
    tasaManualMensual,
    promedioCalculadoArgly,
    incluirServicios,
    servicios,
    incluirExpensas,
    expensas,
  } = params;

  // Determinar la tasa mensual a utilizar para proyectar
  const tasaMensualEfectiva = usarPromedioHistorico
    ? promedioCalculadoArgly
    : tasaManualMensual;

  let alquilerActual = alquilerInicial;
  let factorAjusteAcumulado = 1.0;

  // Estado mutable temporal para servicios y expensas
  const serviciosActuales = servicios.map((s) => ({ ...s, montoActual: s.monto }));
  let expensasActuales = expensas.montoInicial;

  const resultado: DetalleMes[] = [];

  for (let i = 1; i <= duracionMeses; i++) {
    // Multiplicar factor de inflación mensual compuesto
    factorAjusteAcumulado *= (1 + tasaMensualEfectiva / 100);

    // ¿Toca reajuste del valor del alquiler? (ej: meses 4, 7, 10 para frecuencia 3)
    const esMesDeAjuste = i > 1 && (i - 1) % frecuenciaAjuste === 0;

    if (esMesDeAjuste) {
      alquilerActual = Math.round(alquilerActual * factorAjusteAcumulado);
      factorAjusteAcumulado = 1.0; // Reset
    }

    // Calcular Servicios (si está activado el módulo y cada servicio individual)
    const desgloseServicios: Record<string, number> = {};
    let totalServiciosMes = 0;

    if (incluirServicios) {
      serviciosActuales.forEach((s) => {
        if (s.activo) {
          if (i > 1) {
            s.montoActual = Math.round(s.montoActual * (1 + s.aumentoMensualEst / 100));
          }
          desgloseServicios[s.nombre] = s.montoActual;
          totalServiciosMes += s.montoActual;
        }
      });
    }

    // Calcular Expensas
    let totalExpensasMes = 0;
    if (incluirExpensas && expensas.activo) {
      if (i > 1) {
        expensasActuales = Math.round(expensasActuales * (1 + expensas.aumentoMensualEst / 100));
      }
      totalExpensasMes = expensasActuales;
    }

    resultado.push({
      numeroMes: i,
      montoAlquiler: alquilerActual,
      montoExpensas: totalExpensasMes,
      desgloseServicios,
      totalServicios: totalServiciosMes,
      costoTotalMes: alquilerActual + totalExpensasMes + totalServiciosMes,
      esMesDeAjuste,
    });
  }

  return resultado;
}