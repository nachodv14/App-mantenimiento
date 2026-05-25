import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request, { params }) {
  // En Next.js App Router, params se deben extraer asíncronamente en versiones recientes o sincrónicamente dependiendo de la versión.
  // Es más seguro extraerlo directo si no usamos hooks asincrónos.
  const { id } = await params;

  try {
    const data = await request.json();

    // Si envían el status (Aprobar/Rechazar directo o con observación)
    if (data.status) {
      if (!['APPROVED', 'REJECTED'].includes(data.status)) {
        return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
      }
      
      if (data.supervisor_obs !== undefined) {
        await query('UPDATE tasks SET status = $1, supervisor_obs = $2 WHERE id = $3', [data.status, data.supervisor_obs, id]);
      } else {
        await query('UPDATE tasks SET status = $1 WHERE id = $2', [data.status, id]);
      }
      return NextResponse.json({ success: true, message: `Tarea marcada como ${data.status}` });
    }

    // Si envían una edición completa de la tarea
    const { start_time, end_time, description, deviation, observaciones, supervisor_obs } = data;
    
    let updateQuery = `
      UPDATE tasks 
      SET description = $1, deviation = $2, observaciones = $3, supervisor_obs = $4
    `;
    let params = [description || '', deviation || null, observaciones || null, supervisor_obs || null];
    let paramIndex = 5;

    if (start_time && end_time) {
      updateQuery += `, start_time = $${paramIndex++}, end_time = $${paramIndex++}, total_time_minutes = (EXTRACT(EPOCH FROM ($${paramIndex-1}::time - $${paramIndex-2}::time))/60 + 1440)::int % 1440`;
      params.push(start_time, end_time);
    }

    updateQuery += ` WHERE id = $${paramIndex}`;
    params.push(id);

    await query(updateQuery, params);

    return NextResponse.json({ success: true, message: 'Tarea actualizada correctamente' });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
