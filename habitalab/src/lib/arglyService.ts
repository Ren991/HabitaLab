// src/lib/arglyService.ts

export interface ArglyResponse {
  fecha: string;
  valor: number;
  variacion_mensual?: number;
  [key: string]: any;
}

export async function fetchUltimoIPC(): Promise<number> {
  try {
    const res = await fetch('/api/argly?endpoint=ipc');
    if (!res.ok) throw new Error('Error al obtener IPC');
    const data = await res.json();
    return data.variacion_mensual ?? data.valor ?? 2.5;
  } catch (error) {
    console.warn('Fallback IPC usado por error de red:', error);
    return 2.5;
  }
}

export async function fetchUltimoICL(): Promise<number> {
  try {
    const res = await fetch('/api/argly?endpoint=icl');
    if (!res.ok) throw new Error('Error al obtener ICL');
    const data = await res.json();
    return data.variacion_mensual ?? data.valor ?? 3.0;
  } catch (error) {
    console.warn('Fallback ICL usado por error de red:', error);
    return 3.0;
  }
}

export async function fetchHistoricoIPC(): Promise<ArglyResponse[]> {
  try {
    const res = await fetch('/api/argly?endpoint=ipc&historico=true');
    if (!res.ok) throw new Error('Error al obtener histórico IPC');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.datos || []);
  } catch (error) {
    console.warn('Fallback histórico IPC usado:', error);
    return [];
  }
}

export async function fetchHistoricoICL(): Promise<ArglyResponse[]> {
  try {
    const res = await fetch('/api/argly?endpoint=icl&historico=true');
    if (!res.ok) throw new Error('Error al obtener histórico ICL');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.datos || []);
  } catch (error) {
    console.warn('Fallback histórico ICL usado:', error);
    return [];
  }
}