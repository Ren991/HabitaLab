// src/lib/calculatorEngine.ts

export type TipoIndice = 'IPC' | 'ICL';
export type FrecuenciaAjuste = 3 | 4 | 6 | 12; // Trimestral, Cuatrimestral, Semestral, Anual
export type DuracionContrato = 12 | 24 | 36; // Duraciones estándar en Argentina

export type EsqueletEstrategia = 'CONSTANTE' | 'DESACELERACION_PROGRESIVA' | 'HISTORICO_SERIE';

export interface ServicioItem {
  id: string;
  nombre: string;
  monto: number;
  aumentoMensualEst: number; // % estimado mensual
  activo: boolean;
}

export interface ConfigExpensas {
  activo: boolean;
  montoInicial: number;
  aumentoMensualEst: number; // % estimado mensual
}

export interface ParametrosCalculo {
  alquilerInicial: number;
  duracionMeses: DuracionContrato;
  frecuenciaAjuste: FrecuenciaAjuste;
  indice: TipoIndice;

  // Estrategias macroeconómicas avanzadas
  estrategiaInflacion: EsqueletEstrategia;
  tasaMensualBase: number; // Tasa mensual estimada inicial (ej: 3.5%)
  
  // En caso de usar 'DESACELERACION_PROGRESIVA':
  // Porcentaje relativo en que baja la inflación mes a mes (ej: 2% mensual sobre la tasa base)
  factorDesaceleracionMensual?: number; 

  // Servicios & Expensas
  incluirServicios: boolean;
  servicios: ServicioItem[];

  incluirExpensas: boolean;
  expensas: ConfigExpensas;
}

export interface DetalleMes {
  numeroMes: number;
  montoAlquiler: number;
  tasaAplicadaMes: number; // Muestra la tasa mensual proyectada para ese mes
  montoExpensas: number;
  desgloseServicios: Record<string, number>;
  totalServicios: number;
  costoTotalMes: number;
  esMesDeAjuste: boolean;
  variacionAcumuladaTramo: number; // Porcentaje total del último incremento
}

/**
 * Motor de Cálculo Económico Habitacional para Argentina (HabitaLab)
 */
export function calcularProyeccionContrato(params: ParametrosCalculo): DetalleMes[] {
  const {
    alquilerInicial,
    duracionMeses,
    frecuenciaAjuste,
    indice,
    estrategiaInflacion,
    tasaMensualBase,
    factorDesaceleracionMensual = 0,
    incluirServicios,
    servicios,
    incluirExpensas,
    expensas,
  } = params;

  // Clone local de servicios para mantener inmutabilidad
  const serviciosActuales = servicios.map((s) => ({ ...s, montoActual: s.monto }));
  let expensasActuales = expensas.montoInicial;
  let alquilerActual = alquilerInicial;

  const resultado: DetalleMes[] = [];

  // Almacena las tasas mensuales proyectadas mes a mes para calcular índices acumulados reales
  const curvaTasasMensuales: number[] = [];
  
  // Proyectar la curva de tasas de inflación/ICL según la estrategia
  let tasaCorriente = tasaMensualBase;
  for (let m = 1; m <= duracionMeses; m++) {
    curvaTasasMensuales.push(tasaCorriente);
    if (estrategiaInflacion === 'DESACELERACION_PROGRESIVA' && factorDesaceleracionMensual > 0) {
      // Modela la baja progresiva de la tasa (ej: 3% -> 2.94% -> 2.88%)
      tasaCorriente = Math.max(0.2, tasaCorriente * (1 - factorDesaceleracionMensual / 100));
    }
  }

  let variacionAcumuladaUltimoTramo = 0;

  for (let i = 1; i <= duracionMeses; i++) {
    const esMesDeAjuste = i > 1 && (i - 1) % frecuenciaAjuste === 0;

    if (esMesDeAjuste) {
      // 1. Obtener los meses correspondientes al tramo de ajuste anterior (ej: meses i-frecuenciaAjuste a i-1)
      const indiceInicio = i - 1 - frecuenciaAjuste;
      const indiceFin = i - 1;
      const tasasTramo = curvaTasasMensuales.slice(indiceInicio, indiceFin);

      // 2. Cálculo del Factor Acumulado Compuesto Real:
      // Factor = (1 + r1) * (1 + r2) * ... * (1 + rn)
      let factorAjusteAcumulado = 1;
      tasasTramo.forEach((tasa) => {
        factorAjusteAcumulado *= (1 + tasa / 100);
      });

      variacionAcumuladaUltimoTramo = (factorAjusteAcumulado - 1) * 100;
      alquilerActual = Math.round(alquilerActual * factorAjusteAcumulado);
    }

    // 3. Proyección de Servicios
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

    // 4. Proyección de Expensas
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
      tasaAplicadaMes: Number(curvaTasasMensuales[i - 1].toFixed(2)),
      montoExpensas: totalExpensasMes,
      desgloseServicios,
      totalServicios: totalServiciosMes,
      costoTotalMes: alquilerActual + totalExpensasMes + totalServiciosMes,
      esMesDeAjuste,
      variacionAcumuladaTramo: Number(variacionAcumuladaUltimoTramo.toFixed(2)),
    });
  }

  return resultado;
}