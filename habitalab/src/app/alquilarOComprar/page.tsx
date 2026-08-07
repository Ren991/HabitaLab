'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Key, Home, TrendingUp, Calculator, AlertCircle, RefreshCw } from 'lucide-react';

interface Resultados {
  gastoTotalAlquiler: number;
  patrimonioFinalInversion: number;
  cuotaHipotecariaMensual: number;
  pagoTotalHipotecario: number;
  gastosInicialesCompra: number;
  costoMantenimientoTotal: number;
  valorPropiedadFuturo: number;
  depreciacionAcumulada: number;
  patrimonioFinalPropiedad: number;
  convieneComprar: boolean;
  diferencia: number;
}

export default function AlquilarOComprar() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Parámetro Global
  const [horizonteAnios, setHorizonteAnios] = useState<number>(15);

  // Columna 1: Alquiler e Inversión
  const [alquilerInicial, setAlquilerInicial] = useState<number>(400);
  const [frecuenciaAjusteMeses, setFrecuenciaAjusteMeses] = useState<number>(3); // Cada 3 meses por defecto
  const [aumentoPorPeriodoPct, setAumentoPorPeriodoPct] = useState<number>(5); // 5% cada 3 meses
  const [aporteMensualInv, setAporteMensualInv] = useState<number>(200);
  const [rendimientoAnualInv, setRendimientoAnualInv] = useState<number>(8); // 8% anual mercado

  // Columna 2: Compra, Crédito y Depreciación
  const [precioPropiedad, setPrecioPropiedad] = useState<number>(100000);
  const [apreciacionAnualPropiedad, setApreciacionAnualPropiedad] = useState<number>(2); // 2% anual suba del mercado
  const [depreciacionAnualPct, setDepreciacionAnualPct] = useState<number>(0.8); // 0.8% anual desgaste físico
  const [porcentajeFinanciado, setPorcentajeFinanciado] = useState<number>(80);
  const [tasaHipotecaria, setTasaHipotecaria] = useState<number>(7.5);
  const [plazoCreditoAnios, setPlazoCreditoAnios] = useState<number>(20);
  const [gastosEscrituraPct, setGastosEscrituraPct] = useState<number>(8);
  const [mantenimientoAnualPct, setMantenimientoAnualPct] = useState<number>(1); // 1% anual

  // Estado de resultados
  const [resultados, setResultados] = useState<Resultados | null>(null);

  const formatNumber = (num: number) => {
    if (!isMounted) return '0';
    return new Intl.NumberFormat('es-AR', {
      maximumFractionDigits: 0,
    }).format(Math.round(num));
  };

  const calcularEscenarios = (e: FormEvent) => {
    e.preventDefault();

    const mesesTotales = horizonteAnios * 12;

    // --- CÁLCULOS HIPOTECA Y CAPITAL INICIAL ---
    const gastosInicialesEscritura = precioPropiedad * (gastosEscrituraPct / 100);
    const montoFinanciado = precioPropiedad * (porcentajeFinanciado / 100);
    const pagoEntradaInicial = precioPropiedad * (1 - porcentajeFinanciado / 100);
    const capitalInicialDisponible = pagoEntradaInicial + gastosInicialesEscritura;

    // --- ESCENARIO 1: ALQUILER CON AJUSTE ESCALONADO E INVERSIÓN ---
    let gastoTotalAlquiler = 0;
    let alquilerActual = alquilerInicial;

    for (let m = 1; m <= mesesTotales; m++) {
      gastoTotalAlquiler += alquilerActual;

      // Se aplica el aumento solo cuando se completa el bloque de meses correspondiente
      if (m % frecuenciaAjusteMeses === 0) {
        alquilerActual *= 1 + aumentoPorPeriodoPct / 100;
      }
    }

    const tasaMensualInv = rendimientoAnualInv / 100 / 12;
    let patrimonioInversion = capitalInicialDisponible;

    for (let m = 1; m <= mesesTotales; m++) {
      patrimonioInversion = patrimonioInversion * (1 + tasaMensualInv) + aporteMensualInv;
    }

    const patrimonioFinalInversion = patrimonioInversion - gastoTotalAlquiler;

    // --- ESCENARIO 2: COMPRA (APRECIACIÓN + DEPRECIACIÓN) ---
    const tasaMensualHipotecaria = tasaHipotecaria / 100 / 12;
    const mesesCredito = plazoCreditoAnios * 12;

    let cuotaHipotecariaMensual = 0;
    if (tasaMensualHipotecaria > 0 && montoFinanciado > 0) {
      cuotaHipotecariaMensual =
        (montoFinanciado *
          (tasaMensualHipotecaria * Math.pow(1 + tasaMensualHipotecaria, mesesCredito))) /
        (Math.pow(1 + tasaMensualHipotecaria, mesesCredito) - 1);
    }

    const mesesPagandoHipotecarios = Math.min(mesesTotales, mesesCredito);
    const pagoTotalHipotecario = cuotaHipotecariaMensual * mesesPagandoHipotecarios;

    const costoMantenimientoAnual = precioPropiedad * (mantenimientoAnualPct / 100);
    const costoMantenimientoTotal = costoMantenimientoAnual * horizonteAnios;

    // CÁLCULO DE VALOR FUTURO
    const valorSinDepreciacion =
      precioPropiedad * Math.pow(1 + apreciacionAnualPropiedad / 100, horizonteAnios);

    const factorDepreciacion = Math.pow(1 - depreciacionAnualPct / 100, horizonteAnios);
    const valorPropiedadFuturo = valorSinDepreciacion * factorDepreciacion;

    const depreciacionAcumulada = valorSinDepreciacion - valorPropiedadFuturo;

    const patrimonioFinalPropiedad =
      valorPropiedadFuturo - pagoTotalHipotecario - gastosInicialesEscritura - costoMantenimientoTotal;

    const convieneComprar = patrimonioFinalPropiedad > patrimonioFinalInversion;
    const diferencia = Math.abs(patrimonioFinalPropiedad - patrimonioFinalInversion);

    setResultados({
      gastoTotalAlquiler,
      patrimonioFinalInversion,
      cuotaHipotecariaMensual,
      pagoTotalHipotecario,
      gastosInicialesCompra: gastosInicialesEscritura,
      costoMantenimientoTotal,
      valorPropiedadFuturo,
      depreciacionAcumulada,
      patrimonioFinalPropiedad,
      convieneComprar,
      diferencia,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Simulador: ¿Alquilar o Comprar Inmueble?</h1>
        <p className="text-slate-600 text-sm">
          Compara el flujo de caja con alquiler ajustado periódicamente e inversión frente a la compra con crédito y desgaste.
        </p>
      </div>

      <form onSubmit={calcularEscenarios} className="space-y-6">
        
        {/* PARÁMETRO GLOBAL */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-slate-800 text-sm">Horizonte Temporal de Evaluación:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="50"
              required
              value={horizonteAnios}
              onChange={(e) => setHorizonteAnios(Number(e.target.value))}
              className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-center font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <span className="text-sm text-slate-600 font-medium">Años</span>
          </div>
        </div>

        {/* CONTENEDOR 2 COLUMNAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* COLUMNA 1: ALQUILER E INVERSIÓN */}
          <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-blue-50 pb-3">
              <Key className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-800 text-lg">1. Opción Alquilar e Invertir</h2>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                Estructura de Alquiler
              </span>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Alquiler Mensual Inicial (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={alquilerInicial}
                  onChange={(e) => setAlquilerInicial(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ajuste cada <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={frecuenciaAjusteMeses}
                    onChange={(e) => setFrecuenciaAjusteMeses(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                  >
                    <option value={1}>1 Mes</option>
                    <option value={3}>3 Meses</option>
                    <option value={4}>4 Meses</option>
                    <option value={6}>6 Meses</option>
                    <option value={12}>12 Meses (1 año)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Aumento por Periodo (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0"
                    value={aumentoPorPeriodoPct}
                    onChange={(e) => setAumentoPorPeriodoPct(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <span className="text-[10px] text-slate-400">Aumento aplicado cada {frecuenciaAjusteMeses} meses</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
                Rendimiento del Capital
              </span>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Aporte Extra Mensual a Inversión (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={aporteMensualInv}
                  onChange={(e) => setAporteMensualInv(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Rendimiento Estimado Mercado Financiero (% Anual) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="0"
                  value={rendimientoAnualInv}
                  onChange={(e) => setRendimientoAnualInv(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* COLUMNA 2: COMPRA Y CRÉDITO */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-emerald-50 pb-3">
              <Home className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-800 text-lg">2. Opción Comprar Propiedad</h2>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Valor y Desgaste del Inmueble
              </span>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Precio Total del Inmueble (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={precioPropiedad}
                  onChange={(e) => setPrecioPropiedad(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Apreciación (%/Año) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={apreciacionAnualPropiedad}
                    onChange={(e) => setApreciacionAnualPropiedad(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Depreciación (%/Año) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0"
                    value={depreciacionAnualPct}
                    onChange={(e) => setDepreciacionAnualPct(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Escritura (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0"
                    value={gastosEscrituraPct}
                    onChange={(e) => setGastosEscrituraPct(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mantenimiento (%/Año) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0"
                    value={mantenimientoAnualPct}
                    onChange={(e) => setMantenimientoAnualPct(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
                Condiciones de la Hipoteca
              </span>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  % Financiamiento Banco <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={porcentajeFinanciado}
                  onChange={(e) => setPorcentajeFinanciado(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tasa Crédito (% Anual) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0"
                    value={tasaHipotecaria}
                    onChange={(e) => setTasaHipotecaria(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Plazo Crédito (Años) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="40"
                    value={plazoCreditoAnios}
                    onChange={(e) => setPlazoCreditoAnios(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTÓN SUBMIT */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <TrendingUp className="w-5 h-5" />
            Calcular Comparativa
          </button>
        </div>
      </form>

      {/* RESULTADOS */}
      {resultados && isMounted && (
        <div className="space-y-6 pt-6 border-t border-slate-200">
          
          <div
            className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
              resultados.convieneComprar
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  resultados.convieneComprar ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                {resultados.convieneComprar ? <Home className="w-6 h-6" /> : <Key className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-70 block">
                  Conclusión a {horizonteAnios} Años
                </span>
                <h3 className="text-xl font-extrabold">
                  {resultados.convieneComprar
                    ? 'Financieramente conviene Comprar'
                    : 'Financieramente conviene Alquilar e Invertir'}
                </h3>
              </div>
            </div>

            <div className="text-right border-t md:border-t-0 md:border-l border-slate-200/60 pt-3 md:pt-0 md:pl-6 w-full md:w-auto">
              <span className="text-xs opacity-75 block font-medium">Diferencia Estimada de Patrimonio</span>
              <span className="text-2xl font-black">
                ~${formatNumber(resultados.diferencia)} USD
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD ALQUILER */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between border-b border-slate-200 pb-2">
                <span>Resumen Alquiler e Inversión</span>
                {!resultados.convieneComprar && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">
                    Opción Más Rentable
                  </span>
                )}
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1">
                  <span>Gasto total en Alquileres (Escalonado):</span>
                  <span className="font-bold text-slate-800">-${formatNumber(resultados.gastoTotalAlquiler)} USD</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Patrimonio generado por Inversiones:</span>
                  <span className="font-bold text-emerald-600">
                    +${formatNumber(resultados.patrimonioFinalInversion + resultados.gastoTotalAlquiler)} USD
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-sm text-slate-900">
                  <span>Patrimonio Neto Final:</span>
                  <span>${formatNumber(resultados.patrimonioFinalInversion)} USD</span>
                </div>
              </div>
            </div>

            {/* CARD COMPRA */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between border-b border-slate-200 pb-2">
                <span>Resumen Compra e Inmueble</span>
                {resultados.convieneComprar && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                    Opción Más Rentable
                  </span>
                )}
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1">
                  <span>Valor Futuro Neto del Inmueble:</span>
                  <span className="font-bold text-emerald-600">${formatNumber(resultados.valorPropiedadFuturo)} USD</span>
                </div>
                <div className="flex justify-between py-1 text-amber-700">
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Impacto Estimado de Depreciación:
                  </span>
                  <span className="font-bold">-${formatNumber(resultados.depreciacionAcumulada)} USD</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total Hipoteca + Escritura + Mantenimiento:</span>
                  <span className="font-bold text-slate-800">
                    -${formatNumber(resultados.pagoTotalHipotecario + resultados.costoMantenimientoTotal + resultados.gastosInicialesCompra)} USD
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-sm text-slate-900">
                  <span>Patrimonio Neto Final (Inmueble - Pagos):</span>
                  <span>${formatNumber(resultados.patrimonioFinalPropiedad)} USD</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}