import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();

    // Validar datos básicos
    if (!data.plant || !data.task_date || !data.operator_id || !data.tasks || data.tasks.length === 0) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    // Guardar cada tarea en la DB
    for (const t of data.tasks) {
      await query(`
        INSERT INTO tasks (
          plant, task_date, shift, operator_id, companions, start_time, end_time, 
          description, task_type, category, machine_id, nature, deviation, observaciones,
          affects_availability, final_state, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 
          $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17
        )
      `, [
        data.plant,
        data.task_date,
        data.shift,
        data.operator_id,
        JSON.stringify(t.companions || []),
        t.start_time,
        t.end_time,
        t.description || '',
        t.record_type,
        t.category || null,
        t.machine_id || null,
        t.nature || null,
        t.deviation || null,
        t.observaciones || null,
        t.affects_availability || false,
        t.final_state || null,
        'PENDING'
      ]);
    }

    return NextResponse.json({ message: 'Jornada guardada correctamente', status: 'success' });
  } catch (error) {
    console.error('Error saving tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
