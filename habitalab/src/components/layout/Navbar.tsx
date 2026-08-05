import Link from 'next/link';
import { ArrowRight, Activity } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-950 tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <span>Habita<span className="text-slate-400 font-normal">Lab</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/simulador" className="hover:text-slate-950 transition-colors">Simulador</Link>
          <Link href="#indices" className="hover:text-slate-950 transition-colors">Índices BCRA / INDEC</Link>
          <Link href="#modulos" className="hover:text-slate-950 transition-colors">Módulos</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/simulador"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-slate-950 hover:bg-slate-800 transition-all shadow-sm"
          >
            Proyectar Contrato
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}