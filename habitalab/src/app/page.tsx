import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { ArrowRight, Calculator, Building2, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-20 pb-16 md:pt-28 md:pb-24 px-6 border-b border-slate-100">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            
            {/* BADGE DE ESTADO */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Conectado a datos oficiales de Argly (IPC / ICL)
            </div>

            {/* TITULAR INTENSO */}
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1]">
              Matemáticas claras para tu alquiler <br className="hidden md:block" />
              <span className="text-slate-400 font-bold">sin sorpresas de inflación.</span>
            </h1>

            {/* SUBTITULO */}
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Proyectá aumentos trimestrales o cuatrimestrales, parametrizá tarifas de servicios (EPE, Litoral Gas, TGI) y simulá tu presupuesto real mes a mes.
            </p>

            {/* CTAS */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/simulador"
                className="w-full sm:w-auto h-12 px-7 rounded-xl text-base font-bold text-white bg-slate-950 hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2"
              >
                Abrir Simulador
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#modulos"
                className="w-full sm:w-auto h-12 px-7 rounded-xl text-base font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center"
              >
                Explorar Módulos
              </a>
            </div>

            {/* METRICAS RAPIDAS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto text-left border-t border-slate-100">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Último IPC Oficial</p>
                <p className="text-2xl font-black text-slate-950 mt-1">1.9% <span className="text-xs font-medium text-emerald-600">/ mes</span></p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Actualización ICL</p>
                <p className="text-2xl font-black text-slate-950 mt-1">Diaria <span className="text-xs font-medium text-slate-500">(BCRA)</span></p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Parámetros</p>
                <p className="text-2xl font-black text-slate-950 mt-1">Ajustables <span className="text-xs font-medium text-slate-500">Custom Delta</span></p>
              </div>
            </div>

          </div>
        </section>

        {/* FEATURE GRID: LOS MÓDULOS DE HABITALAB */}
        <section id="modulos" className="py-20 px-6 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            
            <div className="mb-14 text-center md:text-left max-w-xl">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
                Una suite modular para la vivienda
              </h2>
              <p className="text-slate-600 mt-2">
                HabitaLab nace como una herramienta de simulación y se extiende a toda la gestión de costos habitacionales.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              
              {/* CARD 1: SIMULADOR (ACTIVO) */}
              <div className="p-8 rounded-2xl bg-white border-2 border-slate-950 shadow-sm relative flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center mb-6">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 mb-3">
                    Módulo Activo
                  </span>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Simulador de Alquiler</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Calculá la proyección exacta a 12, 24 o 36 meses. Seleccioná aumentos por IPC o ICL, ajustá la frecuencia y sumá tarifas de luz, agua y gas.
                  </p>
                </div>
                <Link 
                  href="/simulador"
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-950 hover:underline"
                >
                  Usar herramienta ahora <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* CARD 2: COMPARADOR (PROXIMO) */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200 opacity-80 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-6">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 mb-3">
                    Próximamente
                  </span>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Comparador de Deptos</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Compará dos o tres opciones de alquiler en paralelo teniendo en cuenta el valor base, expensas promedio y costo proyectado de servicios.
                  </p>
                </div>
              </div>

              {/* CARD 3: CONTROL DE EXPENSAS Y SERVICIOS */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200 opacity-80 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-6">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 mb-3">
                    Próximamente
                  </span>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Histórico de Servicios</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Seguimiento mensual de variaciones en la EPE, Litoral Gas, Aguas Santafesinas y TGI para detectar saltos de consumo o aumentos de tarifa.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 HabitaLab. Datos consumidos de fuentes abiertas.</p>
          <p className="font-mono">Rosario, Santa Fe</p>
        </div>
      </footer>
    </div>
  );
}