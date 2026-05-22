import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request, { params }) {
  // En Next.js App Router, params se deben extraer asíncronamente en versiones recientes o sincrónicamente dependiendo de la versión.
  // Es más seguro extraerlo directo si no usamos hooks asincrónos.
  const { id } = await params;

  try {
    const { status } = await request.json();

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    await query('UPDATE tasks SET status = $1 WHERE id = $2', [status, id]);

    return NextResponse.json({ success: true, message: `Tarea marcada como ${status}` });
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
