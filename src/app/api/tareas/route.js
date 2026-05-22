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
    for (const task of data.tasks) {
      await query(`
        INSERT INTO tasks (
          plant, task_date, shift, operator_id, companions, start_time, end_time, 
          description, task_type, category, machine_id, nature, deviation, 
          affects_availability, final_state, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 
          $8, $9, $10, $11, $12, $13, 
          $14, $15, 'PENDING'
        )
      `, [
        data.plant, 
        data.task_date, 
        data.shift, 
        data.operator_id, 
        task.companions || null,
        task.start_time, 
        task.end_time, 
        task.description || '', 
        task.record_type, 
        task.category || null, 
        task.machine_id || null, 
        task.nature || null, 
        task.deviation || null, 
        task.affects_availability || false, 
        task.final_state || null
      ]);
    }

    return NextResponse.json({ message: 'Jornada guardada correctamente', status: 'success' });
  } catch (error) {
    console.error('Error saving tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
