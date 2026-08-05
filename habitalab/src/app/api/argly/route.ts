// src/app/api/argly/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'ipc';
  const historico = searchParams.get('historico') === 'true';

  try {
    const targetUrl = `https://api.argly.com.ar/v1/${endpoint}${historico ? '?historico=true' : ''}`;
    
    const res = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error desde Argly: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en proxy Argly:', error);
    return NextResponse.json(
      { error: 'Error al conectar con la API de Argly' },
      { status: 500 }
    );
  }
}