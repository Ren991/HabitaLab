export interface RentVsBuyInputARS {
  // 1. Datos Inmueble y Capital Inicial
  valorInmuebleARS: number;            // Ej: $120.000.000
  alquilerInicialARS: number;          // Ej: $450.000
  ahorroDisponibleARS: number;         // Ej: $30.000.000 (Capital inicial total del usuario)

  // 2. Parámetros del Crédito Hipotecario
  porcentajeEntradaCredito: number;    // Ej: 25% (Lo que se paga con el ahorro para entrar)
  gastosEscrituraPct: number;          // Ej: 6% (Honorarios, sellos, comisiones)
  tasaHipotecariaAnualPct: number;     // Ej: 8.5% (Tasa sobre capital/UVA)
  plazoAnosCredito: number;            // Ej: 20 años

  // 3. Inversión y Proyección Macroeconómica
  tasaInversionAnualPct: number;       // Ej: 45% (Tasa de interés de su fondo/plazo fijo/FCI)
  aumentoAlquilerAnualPct: number;     // Ajuste estimado anual del alquiler
  apreciacionPropiedadAnualPct: number;// Valorización estimada de la propiedad
  anosSimulacion: number;              // Tiempo total a simular (ej. 10 o 20 años)
}

export interface MesSimulacionARS {
  mes: number;
  // Comprar
  valorPropiedad: number;
  saldoCredito: number;
  cuotaHipoteca: number;
  patrimonioComprar: number;
  
  // Alquilar
  alquilerMes: number;
  carteraInversion: number;
  patrimonioAlquilar: number;
}

export interface ResultadoRentVsBuyARS {
  capRatePorcentaje: number;
  pagoEntradaEfectivo: number;
  gastosCierreEfectivo: number;
  excedenteAhorroInvertido: number;
  patrimonioFinalComprar: number;
  patrimonioFinalAlquilar: number;
  diferenciaPatrimonio: number;
  ganador: 'COMPRAR' | 'ALQUILAR';
  historialMeses: MesSimulacionARS[];
}

export function calcularRentVsBuyARS(params: RentVsBuyInputARS): ResultadoRentVsBuyARS {
  const {
    valorInmuebleARS,
    alquilerInicialARS,
    ahorroDisponibleARS,
    porcentajeEntradaCredito,
    gastosEscrituraPct,
    tasaHipotecariaAnualPct,
    plazoAnosCredito,
    tasaInversionAnualPct,
    aumentoAlquilerAnualPct,
    apreciacionPropiedadAnualPct,
    anosSimulacion,
  } = params;

  // --- 1. Entrada al Crédito Hipotecario ---
  const pagoEntradaEfectivo = valorInmuebleARS * (porcentajeEntradaCredito / 100);
  const gastosCierreEfectivo = valorInmuebleARS * (gastosEscrituraPct / 100);
  const costoTotalEntradaCompra = pagoEntradaEfectivo + gastosCierreEfectivo;

  // Monto a financiar por el banco
  const montoCredito = valorInmuebleARS - pagoEntradaEfectivo;

  // Capital inicial que le queda libre a quien decide ALQUILAR
  // (Usa todo el ahorro disponible que tenía pensado para entrar a la propiedad)
  const capitalInicialInversionAlquiler = ahorroDisponibleARS;

  // Cap Rate Neto Inicial (Alquiler Anual / Valor Propiedad)
  const capRatePorcentaje = ((alquilerInicialARS * 12) / valorInmuebleARS) * 100;

  // --- 2. Tasas Mensuales (Interés Compuesto) ---
  const iHipotecaMensual = tasaHipotecariaAnualPct / 100 / 12;
  const iInversionMensual = tasaInversionAnualPct / 100 / 12;
  const iAumentoAlquilerMensual = aumentoAlquilerAnualPct / 100 / 12;
  const iApreciacionPropMensual = apreciacionPropiedadAnualPct / 100 / 12;

  // Cuota Fija Sistema Francés
  const totalMesesCredito = plazoAnosCredito * 12;
  const cuotaHipotecaMensual = (montoCredito > 0 && iHipotecaMensual > 0)
    ? (montoCredito * iHipotecaMensual * Math.pow(1 + iHipotecaMensual, totalMesesCredito)) /
      (Math.pow(1 + iHipotecaMensual, totalMesesCredito) - 1)
    : montoCredito / (totalMesesCredito || 1);

  // --- 3. Simulación Mes a Mes ---
  let saldoCreditoActual = montoCredito;
  let valorPropiedadActual = valorInmuebleARS;
  let alquilerActual = alquilerInicialARS;
  let carteraInversionActual = capitalInicialInversionAlquiler;

  const totalMesesSimulacion = anosSimulacion * 12;
  const historialMeses: MesSimulacionARS[] = [];

  for (let mes = 1; mes <= totalMesesSimulacion; mes++) {
    // --- ESCENARIO COMPRAR ---
    let cuotaMes = 0;
    if (mes <= totalMesesCredito && saldoCreditoActual > 0) {
      const interesMes = saldoCreditoActual * iHipotecaMensual;
      const amortizacionMes = cuotaHipotecaMensual - interesMes;
      saldoCreditoActual = Math.max(0, saldoCreditoActual - amortizacionMes);
      cuotaMes = cuotaHipotecaMensual;
    }

    valorPropiedadActual *= (1 + iApreciacionPropMensual);
    const patrimonioComprar = valorPropiedadActual - saldoCreditoActual;

    // --- ESCENARIO ALQUILAR ---
    // A. Aplicar Interés Compuesto Mensual sobre la cartera acumulada
    carteraInversionActual *= (1 + iInversionMensual);

    // B. Flujo de Caja: Comprar vs. Alquilar
    // Si la cuota del crédito es mayor que el alquiler, el inquilino ahorra e invierte la diferencia.
    // Si el alquiler supera la cuota del crédito, el inquilino debe retirar capital de su inversión.
    const diferenciaGastoMes = cuotaMes - alquilerActual;
    carteraInversionActual += diferenciaGastoMes;

    const patrimonioAlquilar = carteraInversionActual;

    // Ajuste del alquiler para el mes siguiente
    alquilerActual *= (1 + iAumentoAlquilerMensual);

    historialMeses.push({
      mes,
      valorPropiedad: Math.round(valorPropiedadActual),
      saldoCredito: Math.round(saldoCreditoActual),
      cuotaHipoteca: Math.round(cuotaMes),
      patrimonioComprar: Math.round(patrimonioComprar),
      alquilerMes: Math.round(alquilerActual),
      carteraInversion: Math.round(carteraInversionActual),
      patrimonioAlquilar: Math.round(patrimonioAlquilar),
    });
  }

  const patrimonioFinalComprar = historialMeses[historialMeses.length - 1].patrimonioComprar;
  const patrimonioFinalAlquilar = historialMeses[historialMeses.length - 1].patrimonioAlquilar;
  const diferencia = patrimonioFinalComprar - patrimonioFinalAlquilar;

  return {
    capRatePorcentaje: Number(capRatePorcentaje.toFixed(2)),
    pagoEntradaEfectivo: Math.round(pagoEntradaEfectivo),
    gastosCierreEfectivo: Math.round(gastosCierreEfectivo),
    excedenteAhorroInvertido: Math.max(0, ahorroDisponibleARS - costoTotalEntradaCompra),
    patrimonioFinalComprar: Math.round(patrimonioFinalComprar),
    patrimonioFinalAlquilar: Math.round(patrimonioFinalAlquilar),
    diferenciaPatrimonio: Math.round(Math.abs(diferencia)),
    ganador: patrimonioFinalComprar >= patrimonioFinalAlquilar ? 'COMPRAR' : 'ALQUILAR',
    historialMeses,
  };
}