// src/lib/arglyService.ts

export interface ArglyDataPoint {
  fecha: string; // ISO date format YYYY-MM-DD
  valor: number; // Para ICL es el valor absoluto del índice; para IPC suele ser la variación mensual
  variacion_mensual?: number;
}

export type TipoIndice = 'IPC' | 'ICL';

/**
 * Obtiene los últimos N registros históricos de un índice para calcular dinámicas de mercado reales.
 */
export async function fetchHistoricoSerie(
  indice: TipoIndice,
  meses: number = 6
): Promise<ArglyDataPoint[]> {
  try {
    const endpoint = indice.toLowerCase();
    const res = await fetch(`/api/argly?endpoint=${endpoint}&historico=true`);
    if (!res.ok) throw new Error(`Error al obtener histórico de ${indice}`);
    
    const rawData = await res.json();
    const data: ArglyDataPoint[] = Array.isArray(rawData) ? rawData : (rawData.datos || []);
    
    // Devolver los últimos N meses ordenados por fecha ascendente
    return data.slice(-meses);
  } catch (error) {
    console.warn(`Fallback para histórico ${indice}:`, error);
    return [];
  }
}

/**
 * Calcula la Tasa Equivalente Mensual Promedio (CAGR mensual) a partir de una serie de puntos del ICL o IPC.
 */
export function calcularTasaPromedioMensual(serie: ArglyDataPoint[], indice: TipoIndice): number {
  if (serie.length < 2) return indice === 'IPC' ? 2.5 : 3.0; // Fallback económico sensato

  if (indice === 'ICL') {
    // Para el ICL: la variación acumulada entre el primer y último punto de la serie
    const valorInicial = serie[0].valor;
    const valorFinal = serie[serie.length - 1].valor;
    
    // Número de periodos/meses en la serie
    const periodos = serie.length - 1;
    if (valorInicial <= 0 || periodos <= 0) return 3.0;

    // Fórmula CAGR (Compound Annual/Monthly Growth Rate)
    const cagrMensual = Math.pow(valorFinal / valorInicial, 1 / periodos) - 1;
    return cagrMensual * 100; // porcentaje
  } else {
    // Para IPC: promediar las variaciones mensuales informadas
    const variaciones = serie
      .map(d => d.variacion_mensual ?? d.valor)
      .filter(v => typeof v === 'number' && !isNaN(v));

    if (variaciones.length === 0) return 2.5;
    
    const suma = variaciones.reduce((acc, curr) => acc + curr, 0);
    return suma / variaciones.length;
  }
}