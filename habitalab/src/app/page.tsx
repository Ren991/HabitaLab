import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { 
  ArrowRight, 
  Calculator, 
  Scale, 
  PieChart, 
  Building2, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-20 pb-16 md:pt-28 md:pb-24 px-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            
            {/* BADGE DE ESTADO */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado con Argly API (IPC / ICL) & Algoritmo de Interés Compuesto
            </div>

            {/* TITULAR INTENSO */}
            <h1 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
              Decisiones financieras e inmobiliarias, <br className="hidden md:block" />
              <span className="text-slate-400 font-bold">con matemática clara y sin sorpresas.</span>
            </h1>

            {/* SUBTITULO */}
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Proyectá el costo real de tu contrato de alquiler, simulá la compra de tu propiedad frente al interés compuesto de invertir, y analizá el impacto en tu sueldo mes a mes.
            </p>

            {/* CTAS */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/simulador"
                className="w-full sm:w-auto h-12 px-7 rounded-xl text-base font-bold text-white bg-slate-950 hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2"
              >
                Abrir Simulador de Contratos
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#modulos"
                className="w-full sm:w-auto h-12 px-7 rounded-xl text-base font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center"
              >
                Ver Módulos Financieros
              </a>
            </div>

            {/* METRICAS RAPIDAS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto text-left border-t border-slate-100">
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Último IPC Oficial</p>
                <p className="text-2xl font-black text-slate-950 mt-1">1.9% <span className="text-xs font-bold text-emerald-600">/ mes</span></p>
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Actualización ICL</p>
                <p className="text-2xl font-black text-slate-950 mt-1">Diaria <span className="text-xs font-medium text-slate-500">(BCRA)</span></p>
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Proyección Cap Rate</p>
                <p className="text-2xl font-black text-slate-950 mt-1">Neto <span className="text-xs font-medium text-slate-500">ARS / USD</span></p>
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Interés Compuesto</p>
                <p className="text-2xl font-black text-slate-950 mt-1">Mensual <span className="text-xs font-bold text-emerald-600">CAGR</span></p>
              </div>
            </div>

          </div>
        </section>

        {/* FEATURE GRID: LOS MÓDULOS DE HABITALAB */}
        <section id="modulos" className="py-20 px-6 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            
            <div className="mb-14 text-center md:text-left max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
                Hub de Finanzas Inmobiliarias
              </h2>
              <p className="text-slate-600 mt-2 text-base">
                Herramientas diseñadas para analizar contratos de alquiler, la viabilidad de créditos hipotecarios y la evolución de tu patrimonio.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              
              {/* CARD 1: SIMULADOR DE CONTRATOS (ACTIVO) */}
              <div className="p-8 rounded-2xl bg-white border-2 border-slate-950 shadow-sm relative flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center mb-6">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 mb-3">
                    Módulo Activo
                  </span>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Simulador de Alquiler</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Calculá la evolución tramo a tramo (IPC/ICL) a 12, 24 o 36 meses. Parametrizá expensas y tarifas locales (EPE, Litoral Gas, Aguas Santafesinas, TGI).
                  </p>
                </div>
                <Link 
                  href="/simulador"
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-950 hover:underline"
                >
                  Usar herramienta ahora <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* CARD 2: COMPRAR VS. ALQUILAR (NUEVO / EN DESARROLLO O ACTIVO) */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm relative flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center mb-6">
                    <Scale className="w-6 h-6" />
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 mb-3">
                    Nuevo Módulo
                  </span>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Comprar vs. Alquilar</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Evaluá el costo de tomar un crédito hipotecario frente a alquilar e invertir la diferencia de tu capital en un fondo con interés compuesto.
                  </p>
                </div>
                <Link 
                  href="/alquilarOComprar"
                  className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline"
                >
                  Simular Patrimonio <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* CARD 3: ESFUERZO FINANCIERO Y SALARIOS */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm relative flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-6">
                    <PieChart className="w-6 h-6" />
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 mb-3">
                    Próximamente
                  </span>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Esfuerzo Financiero</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Mapeá qué porcentaje del sueldo familiar absorberá la vivienda proyectando aumentos salariales paritarios vs. la curva de inflación.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">En desarrollo</span>
              </div>

              {/* CARD 4: COMPARADOR DE METRO CUADRADO */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200 opacity-85 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-6">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 mb-3">
                    Próximamente
                  </span>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Análisis de $/m²</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Compará el valor del metro cuadrado del inmueble en alquiler o venta contra la mediana promedio de tu barrio o zona.
                  </p>
                </div>
              </div>

              {/* CARD 5: HISTÓRICO Y EVOLUCIÓN DE SERVICIOS */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200 opacity-85 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-6">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 mb-3">
                    Próximamente
                  </span>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Histórico de Servicios</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Seguimiento mensual de variaciones en la EPE, Litoral Gas, Aguas Santafesinas y TGI para detectar saltos de consumo o aumentos de tarifa.
                  </p>
                </div>
              </div>

              {/* CARD 6: ESTIMADOR COSTOS DE ENTRADA */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200 opacity-85 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 mb-3">
                    Próximamente
                  </span>
                  <h3 className="text-xl font-bold text-slate-950 mb-2">Costos de Entrada</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Calculá el capital total necesario previo a mudarte: Depósito en garantía, honorarios, sellado provincial y seguro de caución.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 HabitaLab. Datos consumidos de fuentes abiertas y APIS oficiales.</p>
          <p className="font-mono">Rosario, Santa Fe</p>
        </div>
      </footer>
    </div>
  );
}