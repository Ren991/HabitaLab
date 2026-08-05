// src/components/simulador/GraficoProyeccion.tsx
'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DetalleMes } from '@/lib/calculatorEngine';
import { TrendingUp, Sparkles } from 'lucide-react';

interface GraficoProyeccionProps {
  proyeccion: DetalleMes[];
  usarPromedio: boolean;
  tasaEfectiva: number;
  indice: 'IPC' | 'ICL';
}

export function GraficoProyeccion({
  proyeccion,
  usarPromedio,
  tasaEfectiva,
  indice,
}: GraficoProyeccionProps) {
  const chartData = proyeccion.map((m) => ({
    mesLabel: `Mes ${m.numeroMes}`,
    Alquiler: m.montoAlquiler,
    TotalMes: m.costoTotalMes,
    esAjuste: m.esMesDeAjuste,
  }));

  return (
    <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
      {/* HEADER DEL GRÁFICO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-white tracking-wide">
              Curva de Proyección Estimada
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {usarPromedio ? (
              <span>
                Basado en proyección de <strong>{indice}</strong> ({tasaEfectiva}%/mes prom. Argly)
              </span>
            ) : (
              <span>
                Aumento mensual manual configurado (<strong>{tasaEfectiva}%/mes</strong>)
              </span>
            )}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Proyección a {proyeccion.length} meses</span>
        </div>
      </div>

      {/* ÁREA DEL CHART RECHARTS */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

            <XAxis
              dataKey="mesLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                      <p className="font-extrabold text-slate-200">
                        {data.mesLabel} {data.esAjuste && '🔥 (Mes de Ajuste)'}
                      </p>
                      <p className="text-emerald-400 font-bold">
                        Alquiler: ${data.Alquiler.toLocaleString('es-AR')}
                      </p>
                      <p className="text-slate-300 font-medium">
                        Costo Total: ${data.TotalMes.toLocaleString('es-AR')}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="TotalMes"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload?.esAjuste) {
                  return (
                    <circle
                      key={cx}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#f59e0b"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                }
                return <circle key={cx} cx={cx} cy={cy} r={2} fill="#10b981" />;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* LEYENDA PIE */}
      <div className="flex items-center gap-4 text-[11px] text-slate-400 justify-end pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Evolución Cuota</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>Meses de Reajuste</span>
        </div>
      </div>
    </div>
  );
}