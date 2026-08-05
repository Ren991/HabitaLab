// src/app/simulador/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { GraficoProyeccion } from '@/components/simulador/GraficoProyeccion';
import { 
  fetchUltimoIPC, 
  fetchUltimoICL, 
  fetchHistoricoIPC, 
  fetchHistoricoICL 
} from '@/lib/arglyService';
import { 
  calcularProyeccionContrato, 
  TipoIndice, 
  FrecuenciaAjuste, 
  DuracionContrato, 
  ServicioItem,
  DetalleMes 
} from '@/lib/calculatorEngine';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  TrendingUp, 
  Zap, 
  Building, 
  Sparkles,
  DollarSign
} from 'lucide-react';

const SERVICIOS_DEFAULT: ServicioItem[] = [
  { id: '1', nombre: 'Luz (EPE)', monto: 18000, aumentoMensualEst: 3.5, activo: true },
  { id: '2', nombre: 'Gas (Litoral Gas)', monto: 8500, aumentoMensualEst: 3.0, activo: true },
  { id: '3', nombre: 'Agua (Aguas Santafesinas)', monto: 7200, aumentoMensualEst: 2.5, activo: true },
  { id: '4', nombre: 'TGI Municipal', monto: 9500, aumentoMensualEst: 2.0, activo: true },
  { id: '5', nombre: 'API Provincial', monto: 6000, aumentoMensualEst: 2.0, activo: true },
];

export default function SimuladorPage() {
  // Configuración Principal
  const [alquilerInicial, setAlquilerInicial] = useState<number>(350000);
  const [duracion, setDuracion] = useState<DuracionContrato>(24);
  const [frecuencia, setFrecuencia] = useState<FrecuenciaAjuste>(3);
  const [indice, setIndice] = useState<TipoIndice>('IPC');

  // Inflación / Predicción
  const [usarPromedio, setUsarPromedio] = useState<boolean>(true);
  const [tasaManual, setTasaManual] = useState<number>(3.0);
  const [promedioArgly, setPromedioArgly] = useState<number>(2.5);
  const [ultimoDatoOficial, setUltimoDatoOficial] = useState<number>(2.2);
  const [loadingArgly, setLoadingArgly] = useState<boolean>(true);

  // Módulos Independientes (Servicios y Expensas)
  const [incluirServicios, setIncluirServicios] = useState<boolean>(true);
  const [servicios, setServicios] = useState<ServicioItem[]>(SERVICIOS_DEFAULT);
  
  const [incluirExpensas, setIncluirExpensas] = useState<boolean>(false);
  const [expensasMonto, setExpensasMonto] = useState<number>(45000);
  const [expensasAumento, setExpensasAumento] = useState<number>(3.0);

  // 1. Cargar datos en vivo desde Argly proxy al cambiar de índice
  useEffect(() => {
    let isMounted = true;
    async function cargarDatosArgly() {
      setLoadingArgly(true);
      try {
        if (indice === 'IPC') {
          const ultimo = await fetchUltimoIPC();
          const historico = await fetchHistoricoIPC();
          if (!isMounted) return;

          setUltimoDatoOficial(ultimo);
          if (historico.length >= 3) {
            const ultimos3 = historico.slice(-3);
            const prom = ultimos3.reduce((acc, curr) => acc + (curr.variacion_mensual ?? curr.valor ?? 0), 0) / 3;
            setPromedioArgly(Number(prom.toFixed(2)));
          } else {
            setPromedioArgly(ultimo);
          }
        } else {
          const ultimo = await fetchUltimoICL();
          const historico = await fetchHistoricoICL();
          if (!isMounted) return;

          setUltimoDatoOficial(ultimo);
          if (historico.length >= 3) {
            const ultimos3 = historico.slice(-3);
            const prom = ultimos3.reduce((acc, curr) => acc + (curr.variacion_mensual ?? curr.valor ?? 0), 0) / 3;
            setPromedioArgly(Number(prom.toFixed(2)));
          } else {
            setPromedioArgly(ultimo);
          }
        }
      } catch (err) {
        console.error('Error al cargar indicadores:', err);
      } finally {
        if (isMounted) setLoadingArgly(false);
      }
    }

    cargarDatosArgly();
    return () => { isMounted = false; };
  }, [indice]);

  // 2. CÁLCULO DERIVADO CON useMemo (Previene bucles infinitos y re-renders innecesarios)
  const proyeccion: DetalleMes[] = useMemo(() => {
    return calcularProyeccionContrato({
      alquilerInicial,
      duracionMeses: duracion,
      frecuenciaAjuste: frecuencia,
      indice,
      usarPromedioHistorico: usarPromedio,
      tasaManualMensual: tasaManual,
      promedioCalculadoArgly: promedioArgly,
      incluirServicios,
      servicios,
      incluirExpensas,
      expensas: {
        activo: incluirExpensas,
        montoInicial: expensasMonto,
        aumentoMensualEst: expensasAumento,
      },
    });
  }, [
    alquilerInicial,
    duracion,
    frecuencia,
    indice,
    usarPromedio,
    tasaManual,
    promedioArgly,
    incluirServicios,
    servicios,
    incluirExpensas,
    expensasMonto,
    expensasAumento,
  ]);

  // Handlers para Servicios
  const toggleTodosServicios = (activar: boolean) => {
    setServicios(servicios.map((s) => ({ ...s, activo: activar })));
  };

  const toggleServicioIndividual = (id: string) => {
    setServicios(
      servicios.map((s) => (s.id === id ? { ...s, activo: !s.activo } : s))
    );
  };

  const agregarServicioCustom = () => {
    const nuevo: ServicioItem = {
      id: Date.now().toString(),
      nombre: 'Nuevo Servicio',
      monto: 5000,
      aumentoMensualEst: 2.5,
      activo: true,
    };
    setServicios([...servicios, nuevo]);
  };

  const eliminarServicio = (id: string) => {
    setServicios(servicios.filter((s) => s.id !== id));
  };

  const actualizarServicio = (id: string, field: keyof ServicioItem, value: any) => {
    setServicios(
      servicios.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Métricas rápidas de resumen
  const primerMesTotal = proyeccion[0]?.costoTotalMes || 0;
  const ultimoMesTotal = proyeccion[proyeccion.length - 1]?.costoTotalMes || 0;
  const totalInversionContrato = proyeccion.reduce((acc, m) => acc + m.costoTotalMes, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL IZQUIERDO: CONTROLES Y PARÁMETROS (5 cols) */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* CONFIGURACIÓN BASE */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-950 font-bold text-lg">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h2>Configuración del Alquiler</h2>
            </div>

            {/* ALQUILER INICIAL */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Alquiler Base Inicial ($)
              </label>
              <div className="relative">
                <DollarSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={alquilerInicial || ''}
                  onChange={(e) => setAlquilerInicial(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-950 text-lg focus:outline-none focus:ring-2 focus:ring-slate-950"
                />
              </div>
            </div>

            {/* ÍNDICE (IPC / ICL) */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Índice de Contrato
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIndice('IPC')}
                  className={`py-2.5 px-4 rounded-xl font-bold text-sm border transition-all ${
                    indice === 'IPC'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  IPC (Inflación)
                </button>
                <button
                  type="button"
                  onClick={() => setIndice('ICL')}
                  className={`py-2.5 px-4 rounded-xl font-bold text-sm border transition-all ${
                    indice === 'ICL'
                      ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ICL (Locativo BCRA)
                </button>
              </div>
            </div>

            {/* FRECUENCIA Y DURACIÓN */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Aumento Cada
                </label>
                <select
                  value={frecuencia}
                  onChange={(e) => setFrecuencia(Number(e.target.value) as FrecuenciaAjuste)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 font-bold text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                >
                  <option value={3}>3 Meses (Trimestral)</option>
                  <option value={4}>4 Meses (Cuatrimestral)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Duración Total
                </label>
                <select
                  value={duracion}
                  onChange={(e) => setDuracion(Number(e.target.value) as DuracionContrato)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 font-bold text-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                >
                  <option value={3}>3 Meses</option>
                  <option value={6}>6 Meses</option>
                  <option value={12}>12 Meses (1 año)</option>
                  <option value={18}>18 Meses</option>
                  <option value={24}>24 Meses (2 años)</option>
                  <option value={32}>32 Meses</option>
                </select>
              </div>
            </div>

          </div>

          {/* CARD DE PREDICCIÓN & INFLACIÓN */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-950 font-bold text-base">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3>Proyección de Tasa ({indice})</h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                <Sparkles className="w-3 h-3" /> Argly API
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usarPromedio}
                  onChange={(e) => setUsarPromedio(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-950 focus:ring-slate-950 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  Usar promedio ponderado últimos meses ({indice})
                </span>
              </label>

              {usarPromedio ? (
                <div className="text-xs text-slate-600 pl-7 space-y-1">
                  <p>
                    Último dato oficial: <strong className="text-slate-950">{loadingArgly ? '...' : `${ultimoDatoOficial}%/mes`}</strong>
                  </p>
                  <p>
                    Promedio proyectado Argly: <strong className="text-emerald-700 font-bold">{loadingArgly ? '...' : `${promedioArgly}%/mes`}</strong>
                  </p>
                </div>
              ) : (
                <div className="pl-7">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Tasa Mensual Estimada Personalizada (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tasaManual || ''}
                    onChange={(e) => setTasaManual(parseFloat(e.target.value) || 0)}
                    className="w-full py-2 px-3 bg-white rounded-lg border border-slate-200 font-bold text-slate-950 text-sm focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* GRÁFICO DINÁMICO DE PROYECCIÓN */}
          <GraficoProyeccion
            proyeccion={proyeccion}
            usarPromedio={usarPromedio}
            tasaEfectiva={usarPromedio ? promedioArgly : tasaManual}
            indice={indice}
          />

          {/* CARD EXPENSAS (OPCIONAL) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-950 text-base">
                <Building className="w-5 h-5 text-slate-700" />
                <input
                  type="checkbox"
                  checked={incluirExpensas}
                  onChange={(e) => setIncluirExpensas(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-950 cursor-pointer"
                />
                Expensas Edificio
              </label>
              <span className="text-xs text-slate-400 font-medium">Opcional</span>
            </div>

            {incluirExpensas && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Monto Actual ($)
                  </label>
                  <input
                    type="number"
                    value={expensasMonto || ''}
                    onChange={(e) => setExpensasMonto(parseFloat(e.target.value) || 0)}
                    className="w-full py-2 px-3 border border-slate-200 rounded-lg font-bold text-slate-950 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Aumento Est. (%/mes)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={expensasAumento || ''}
                    onChange={(e) => setExpensasAumento(parseFloat(e.target.value) || 0)}
                    className="w-full py-2 px-3 border border-slate-200 rounded-lg font-bold text-slate-950 text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* CARD SERVICIOS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-950 text-base">
                <Zap className="w-5 h-5 text-amber-500" />
                <input
                  type="checkbox"
                  checked={incluirServicios}
                  onChange={(e) => setIncluirServicios(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-950 cursor-pointer"
                />
                Tarifas de Servicios
              </label>

              {incluirServicios && (
                <div className="flex gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleTodosServicios(true)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleTodosServicios(false)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                  >
                    Ninguno
                  </button>
                </div>
              )}
            </div>

            {incluirServicios && (
              <div className="space-y-3 pt-2">
                {servicios.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <button
                      type="button"
                      onClick={() => toggleServicioIndividual(s.id)}
                      className="text-slate-700 hover:text-slate-950"
                    >
                      {s.activo ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </button>

                    <input
                      type="text"
                      value={s.nombre}
                      onChange={(e) => actualizarServicio(s.id, 'nombre', e.target.value)}
                      className="flex-1 bg-transparent font-bold text-xs text-slate-950 focus:outline-none"
                    />

                    <div className="flex items-center gap-1 w-24">
                      <span className="text-xs text-slate-400">$</span>
                      <input
                        type="number"
                        value={s.monto || ''}
                        onChange={(e) => actualizarServicio(s.id, 'monto', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 px-1.5 py-0.5 rounded text-xs font-bold text-slate-950 focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => eliminarServicio(s.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={agregarServicioCustom}
                  className="w-full py-2 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Agregar otro servicio
                </button>
              </div>
            )}
          </div>

        </section>

        {/* PANEL DERECHO: MÉTRICAS Y TABLA DE EVOLUCIÓN (7 cols) */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* METRICAS EJECUTIVAS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 text-white p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mes 1 (Inicial)</span>
              <p className="text-2xl font-black">${primerMesTotal.toLocaleString('es-AR')}</p>
              <p className="text-[11px] text-slate-400">Alquiler + Servicios</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mes {duracion} (Proyectado)</span>
              <p className="text-2xl font-black text-slate-950">${ultimoMesTotal.toLocaleString('es-AR')}</p>
              <p className="text-[11px] text-emerald-600 font-bold">
                +{(primerMesTotal > 0 ? ((ultimoMesTotal - primerMesTotal) / primerMesTotal * 100).toFixed(0) : 0)}% incremento total
              </p>
            </div>

            <div className="bg-emerald-500 text-slate-950 p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Total del Contrato</span>
              <p className="text-2xl font-black">${totalInversionContrato.toLocaleString('es-AR')}</p>
              <p className="text-[11px] text-slate-900 font-semibold">Inversión a {duracion} meses</p>
            </div>
          </div>

          {/* TABLA DE EVOLUCIÓN MES A MES */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-950 text-lg">Evolución Detallada</h3>
                <p className="text-xs text-slate-500">
                  Ajustes aplicados cada {frecuencia} meses según tasa del {usarPromedio ? `${promedioArgly}% (${indice})` : `${tasaManual}% (Manual)`}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Mes</th>
                    <th className="py-3 px-4">Alquiler</th>
                    {incluirExpensas && <th className="py-3 px-4">Expensas</th>}
                    {incluirServicios && <th className="py-3 px-4">Servicios</th>}
                    <th className="py-3 px-4 text-right">Total Mes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {proyeccion.map((m) => (
                    <tr 
                      key={m.numeroMes} 
                      className={`hover:bg-slate-50 transition-colors ${
                        m.esMesDeAjuste ? 'bg-amber-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 flex items-center gap-2">
                        <span className="font-bold text-slate-950">#{m.numeroMes}</span>
                        {m.esMesDeAjuste && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-900">
                            AJUSTE
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-950">
                        ${m.montoAlquiler.toLocaleString('es-AR')}
                      </td>

                      {incluirExpensas && (
                        <td className="py-3.5 px-4 text-slate-600">
                          ${m.montoExpensas.toLocaleString('es-AR')}
                        </td>
                      )}

                      {incluirServicios && (
                        <td className="py-3.5 px-4 text-slate-600">
                          ${m.totalServicios.toLocaleString('es-AR')}
                        </td>
                      )}

                      <td className="py-3.5 px-4 text-right font-black text-slate-950">
                        ${m.costoTotalMes.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}