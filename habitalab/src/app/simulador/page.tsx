'use client';

import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { GraficoProyeccion } from '@/components/simulador/GraficoProyeccion';
import { fetchHistoricoSerie, calcularTasaPromedioMensual } from '@/lib/arglyService';
import { 
  calcularProyeccionContrato, 
  TipoIndice, 
  FrecuenciaAjuste, 
  DuracionContrato, 
  EsqueletEstrategia,
  ServicioItem,
  DetalleMes 
} from '@/lib/calculatorEngine';
import { 
  Calculator, Plus, Trash2, CheckSquare, Square, TrendingUp, Zap, Building, Sparkles, DollarSign 
} from 'lucide-react';

const SERVICIOS_DEFAULT: ServicioItem[] = [
  { id: '1', nombre: 'Luz (EPE)', monto: 18000, aumentoMensualEst: 3.5, activo: true },
  { id: '2', nombre: 'Gas (Litoral Gas)', monto: 8500, aumentoMensualEst: 3.0, activo: true },
  { id: '3', nombre: 'Agua (Aguas Santafesinas)', monto: 7200, aumentoMensualEst: 2.5, activo: true },
  { id: '4', nombre: 'TGI Municipal', monto: 9500, aumentoMensualEst: 2.0, activo: true },
];

export default function SimuladorPage() {
  // Configuración de Contrato
  const [alquilerInicial, setAlquilerInicial] = useState<number>(350000);
  const [duracion, setDuracion] = useState<DuracionContrato>(24);
  const [frecuencia, setFrecuencia] = useState<FrecuenciaAjuste>(3);
  const [indice, setIndice] = useState<TipoIndice>('IPC');

  // Estrategia de Proyección Económica
  const [estrategia, setEstrategia] = useState<EsqueletEstrategia>('HISTORICO_SERIE');
  const [tasaManualBase, setTasaManualBase] = useState<number>(3.0);
  const [promedioArgly, setPromedioArgly] = useState<number>(2.5);
  const [factorDesaceleracion, setFactorDesaceleracion] = useState<number>(2.0);
  const [loadingArgly, setLoadingArgly] = useState<boolean>(true);

  // Módulos Opcionales
  const [incluirServicios, setIncluirServicios] = useState<boolean>(true);
  const [servicios, setServicios] = useState<ServicioItem[]>(SERVICIOS_DEFAULT);
  const [incluirExpensas, setIncluirExpensas] = useState<boolean>(false);
  const [expensasMonto, setExpensasMonto] = useState<number>(45000);
  const [expensasAumento, setExpensasAumento] = useState<number>(3.0);

  // Carga de datos reales / cálculo CAGR desde Argly
  useEffect(() => {
    let active = true;
    async function loadArglyData() {
      setLoadingArgly(true);
      const serie = await fetchHistoricoSerie(indice, 6);
      if (!active) return;
      
      const tasaCalculada = calcularTasaPromedioMensual(serie, indice);
      setPromedioArgly(Number(tasaCalculada.toFixed(2)));
      setLoadingArgly(false);
    }
    loadArglyData();
    return () => { active = false; };
  }, [indice]);

  // Cálculo de Proyección Optimizado con useMemo
  const proyeccion: DetalleMes[] = useMemo(() => {
    const tasaBase = estrategia === 'HISTORICO_SERIE' ? promedioArgly : tasaManualBase;

    return calcularProyeccionContrato({
      alquilerInicial,
      duracionMeses: duracion,
      frecuenciaAjuste: frecuencia,
      indice,
      estrategiaInflacion: estrategia,
      tasaMensualBase: tasaBase,
      factorDesaceleracionMensual: factorDesaceleracion,
      incluirServicios,
      servicios,
      incluirExpensas,
      expensas: { activo: incluirExpensas, montoInicial: expensasMonto, aumentoMensualEst: expensasAumento },
    });
  }, [alquilerInicial, duracion, frecuencia, indice, estrategia, tasaManualBase, promedioArgly, factorDesaceleracion, incluirServicios, servicios, incluirExpensas, expensasMonto, expensasAumento]);

  // Handlers concisos de Servicios
  const updateServicio = (id: string, key: keyof ServicioItem, value: any) => {
    setServicios(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s));
  };

  const primerMesTotal = proyeccion[0]?.costoTotalMes || 0;
  const ultimoMesTotal = proyeccion[proyeccion.length - 1]?.costoTotalMes || 0;
  const totalInversionContrato = proyeccion.reduce((acc, m) => acc + m.costoTotalMes, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL IZQUIERDO: CONTROLES */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* CONFIGURACIÓN PRINCIPAL */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg text-slate-950">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h2>Configuración del Contrato</h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Alquiler Inicial ($)</label>
              <div className="relative">
                <DollarSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={alquilerInicial || ''}
                  onChange={(e) => setAlquilerInicial(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-slate-950"
                />
              </div>
            </div>

            {/* SELECCIÓN ÍNDICE */}
            <div className="grid grid-cols-2 gap-2">
              {(['IPC', 'ICL'] as TipoIndice[]).map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndice(i)}
                  className={`py-2.5 rounded-xl font-bold text-sm border transition-all ${
                    indice === i ? 'bg-slate-950 text-white border-slate-950 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {i === 'IPC' ? 'IPC (INDEC)' : 'ICL (BCRA)'}
                </button>
              ))}
            </div>

            {/* FRECUENCIA Y DURACIÓN */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Aumento Cada</label>
                <select
                  value={frecuencia}
                  onChange={(e) => setFrecuencia(Number(e.target.value) as FrecuenciaAjuste)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 font-bold text-sm focus:outline-none"
                >
                  <option value={3}>3 Meses (Trimestral)</option>
                  <option value={4}>4 Meses (Cuatrimestral)</option>
                  <option value={6}>6 Meses (Semestral)</option>
                  <option value={12}>12 Meses (Anual)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Duración Contrato</label>
                <select
                  value={duracion}
                  onChange={(e) => setDuracion(Number(e.target.value) as DuracionContrato)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 font-bold text-sm focus:outline-none"
                >
                  <option value={12}>12 Meses (1 año)</option>
                  <option value={24}>24 Meses (2 años)</option>
                  <option value={36}>36 Meses (3 años)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ESTRATEGIA MACROECONÓMICA */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-950">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3>Estrategia Macro</h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                <Sparkles className="w-3 h-3" /> Argly CAGR
              </span>
            </div>

            <select
              value={estrategia}
              onChange={(e) => setEstrategia(e.target.value as EsqueletEstrategia)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 font-bold text-xs bg-slate-50 focus:outline-none"
            >
              <option value="HISTORICO_SERIE">Histórico Reciente (Argly API)</option>
              <option value="CONSTANTE">Tasa Fija Mensual Manual</option>
              <option value="DESACELERACION_PROGRESIVA">Desaceleración / Curva Inflacionaria</option>
            </select>

            {estrategia === 'HISTORICO_SERIE' ? (
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                Tasa mensual equivalente ({indice}):{' '}
                <strong className="text-emerald-700 font-bold">{loadingArgly ? '...' : `${promedioArgly}%/mes`}</strong>
              </p>
            ) : (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tasa Mensual Base (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tasaManualBase}
                    onChange={(e) => setTasaManualBase(parseFloat(e.target.value) || 0)}
                    className="w-full py-2 px-3 border border-slate-200 rounded-lg font-bold text-sm"
                  />
                </div>

                {estrategia === 'DESACELERACION_PROGRESIVA' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Caída Inflacionaria Mensual (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={factorDesaceleracion}
                      onChange={(e) => setFactorDesaceleracion(parseFloat(e.target.value) || 0)}
                      className="w-full py-2 px-3 border border-slate-200 rounded-lg font-bold text-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <GraficoProyeccion proyeccion={proyeccion} usarPromedio={estrategia === 'HISTORICO_SERIE'} tasaEfectiva={promedioArgly} indice={indice} />

          {/* MÓDULO EXPENSAS Y SERVICIOS (SIMPLIFICADO) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-950">
              <Building className="w-5 h-5 text-slate-700" />
              <input type="checkbox" checked={incluirExpensas} onChange={(e) => setIncluirExpensas(e.target.checked)} className="rounded" />
              Expensas Edificio
            </label>

            {incluirExpensas && (
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Monto Initial" value={expensasMonto} onChange={(e) => setExpensasMonto(parseFloat(e.target.value) || 0)} className="p-2 border rounded-lg text-sm font-bold" />
                <input type="number" step="0.5" placeholder="% Aumento" value={expensasAumento} onChange={(e) => setExpensasAumento(parseFloat(e.target.value) || 0)} className="p-2 border rounded-lg text-sm font-bold" />
              </div>
            )}
          </div>

          {/* MÓDULO SERVICIOS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-950">
              <Zap className="w-5 h-5 text-amber-500" />
              <input type="checkbox" checked={incluirServicios} onChange={(e) => setIncluirServicios(e.target.checked)} className="rounded" />
              Servicios e Impuestos
            </label>

            {incluirServicios && (
              <div className="space-y-2">
                {servicios.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                    <button type="button" onClick={() => updateServicio(s.id, 'activo', !s.activo)}>
                      {s.activo ? <CheckSquare className="w-5 h-5 text-emerald-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                    </button>
                    <input type="text" value={s.nombre} onChange={(e) => updateServicio(s.id, 'nombre', e.target.value)} className="flex-1 bg-transparent font-bold text-xs" />
                    <input type="number" value={s.monto} onChange={(e) => updateServicio(s.id, 'monto', parseFloat(e.target.value) || 0)} className="w-20 bg-white border px-2 py-0.5 rounded text-xs font-bold" />
                    <button type="button" onClick={() => setServicios(prev => prev.filter(item => item.id !== s.id))} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setServicios([...servicios, { id: Date.now().toString(), nombre: 'Nuevo Servicio', monto: 5000, aumentoMensualEst: 2.5, activo: true }])} className="w-full py-2 border border-dashed rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" /> Agregar servicio
                </button>
              </div>
            )}
          </div>

        </section>

        {/* PANEL DERECHO: MÉTRICAS Y RESULTADOS */}
        <section className="lg:col-span-7 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard title="Mes 1 (Inicial)" value={`$${primerMesTotal.toLocaleString('es-AR')}`} detail="Alquiler + Servicios" dark />
            <MetricCard title={`Mes ${duracion} (Proyectado)`} value={`$${ultimoMesTotal.toLocaleString('es-AR')}`} detail={`+${primerMesTotal > 0 ? ((ultimoMesTotal - primerMesTotal) / primerMesTotal * 100).toFixed(0) : 0}% incremento`} greenText />
            <MetricCard title="Inversión Total" value={`$${totalInversionContrato.toLocaleString('es-AR')}`} detail={`Acumulado ${duracion} meses`} accent />
          </div>

          {/* TABLA MES A MES */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-950 text-lg">Evolución Detallada</h3>
              <p className="text-xs text-slate-500">Ajuste tramo por tramo con matemática compuesta real</p>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Mes</th>
                    <th className="py-3 px-4">Alquiler</th>
                    <th className="py-3 px-4">% Tramo</th>
                    {incluirExpensas && <th className="py-3 px-4">Expensas</th>}
                    {incluirServicios && <th className="py-3 px-4">Servicios</th>}
                    <th className="py-3 px-4 text-right">Total Mes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {proyeccion.map((m) => (
                    <tr key={m.numeroMes} className={`hover:bg-slate-50 ${m.esMesDeAjuste ? 'bg-amber-50/60 font-semibold' : ''}`}>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span className="font-bold text-slate-950">#{m.numeroMes}</span>
                        {m.esMesDeAjuste && <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-200 text-amber-900">AJUSTE</span>}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-950">${m.montoAlquiler.toLocaleString('es-AR')}</td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-500">
                        {m.esMesDeAjuste ? `+${m.variacionAcumuladaTramo}%` : '-'}
                      </td>
                      {incluirExpensas && <td className="py-3 px-4 text-slate-600">${m.montoExpensas.toLocaleString('es-AR')}</td>}
                      {incluirServicios && <td className="py-3 px-4 text-slate-600">${m.totalServicios.toLocaleString('es-AR')}</td>}
                      <td className="py-3 px-4 text-right font-black text-slate-950">${m.costoTotalMes.toLocaleString('es-AR')}</td>
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

// Subcomponente Auxiliar para Tarjetas de Métricas
function MetricCard({ title, value, detail, dark = false, accent = false, greenText = false }: { title: string; value: string; detail: string; dark?: boolean; accent?: boolean; greenText?: boolean }) {
  return (
    <div className={`p-5 rounded-2xl shadow-sm space-y-1 ${dark ? 'bg-slate-950 text-white' : accent ? 'bg-emerald-500 text-slate-950' : 'bg-white border border-slate-200 text-slate-950'}`}>
      <span className={`text-[11px] font-bold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</span>
      <p className="text-2xl font-black">{value}</p>
      <p className={`text-[11px] ${greenText ? 'text-emerald-600 font-bold' : dark ? 'text-slate-400' : 'text-slate-700'}`}>{detail}</p>
    </div>
  );
}