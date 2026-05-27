import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { runGoogleSheetsSync } from '@/lib/syncSheets';

export async function POST(request) {
  try {
    const data = await request.json();

    // Validar datos básicos
    if (!data.plant || !data.task_date || !data.operator_id || !data.tasks || data.tasks.length === 0) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    // Función para calcular la diferencia de minutos entre dos horas (HH:MM)
    const calculateMinutes = (start, end) => {
      if (!start || !end) return null;
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      let diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff < 0) diff += 24 * 60; // Si cruza la medianoche
      return diff;
    };

    // Guardar cada tarea en la DB
    for (const t of data.tasks) {
      const totalMinutes = calculateMinutes(t.start_time, t.end_time);
      const companionsCount = Array.isArray(t.companions) ? t.companions.length : 0;
      const manHours = totalMinutes ? (totalMinutes / 60) * (companionsCount + 1) : null;
      
      let stopTimeMinutes = null;
      if (t.affects_availability && t.start_out_time && t.end_out_time) {
        stopTimeMinutes = Math.round((new Date(t.end_out_time) - new Date(t.start_out_time)) / 60000);
      }
      
      let taskStartOutTime = null;
      if (t.start_out_date && t.start_out_h && t.start_out_m) {
        try { taskStartOutTime = new Date(`${t.start_out_date}T${t.start_out_h}:${t.start_out_m}:00-03:00`).toISOString(); } catch(e){}
      } else if (t.start_out_h && t.start_out_m) {
        try { taskStartOutTime = new Date(`${data.task_date}T${t.start_out_h}:${t.start_out_m}:00-03:00`).toISOString(); } catch(e){}
      }

      let taskEndOutTime = null;
      if (t.end_out_date && t.end_out_h && t.end_out_m) {
        try { taskEndOutTime = new Date(`${t.end_out_date}T${t.end_out_h}:${t.end_out_m}:00-03:00`).toISOString(); } catch(e){}
      } else if (t.end_out_h && t.end_out_m) {
        try { taskEndOutTime = new Date(`${data.task_date}T${t.end_out_h}:${t.end_out_m}:00-03:00`).toISOString(); } catch(e){}
      }

      const text = `
        INSERT INTO tasks (
          plant, task_date, shift, operator_id, companions,
          start_time, end_time, total_time_minutes, man_hours,
          description, task_type, category, machine_id, nature,
          deviation, observaciones, affects_availability, final_state, status,
          start_out_time, end_out_time, stop_time_minutes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        ) RETURNING id
      `;

      const params = [
        data.plant,
        data.task_date,
        data.shift,
        data.operator_id,
        JSON.stringify(t.companions || []),
        t.start_time,
        t.end_time,
        totalMinutes,
        manHours,
        t.description || '',
        t.record_type,
        t.category || null,
        t.machine_id || null,
        t.nature || null,
        t.deviation || null,
        t.observaciones || null,
        t.affects_availability || false,
        t.final_state || null,
        'PENDING',
        taskStartOutTime,
        taskEndOutTime,
        stopTimeMinutes
      ];

      await query(text, params);

      // Gestionar estado de máquinas fuera de servicio
      if (t.machine_id) {
        if (t.affects_availability && t.final_state === 'No Funcional') {
          const outStartTime = taskStartOutTime || new Date().toISOString();
          await query(`
            INSERT INTO machines_out_of_service (
              plant, machine_id, reported_by, start_time, deviation, is_resolved
            ) VALUES (
              $1, $2, $3, $4, $5, false
            )
          `, [data.plant, t.machine_id, data.operator_id, outStartTime, t.deviation || t.description]);
        } else if (t.final_state === 'Funcional') {
          // La máquina se arregló a la hora que terminó esta tarea
          let resolutionTime;
          try {
            // Construir la fecha/hora local y pasarla a ISO para Postgres
            resolutionTime = new Date(`${data.task_date}T${t.end_time}:00-03:00`).toISOString();
          } catch (e) {
            // Fallback por si hay algún error raro en el formato
            resolutionTime = new Date().toISOString();
          }
          await query(`UPDATE machines_out_of_service SET is_resolved = true, resolved_at = $2 WHERE machine_id = $1 AND is_resolved = false`, [t.machine_id, resolutionTime]);
        }
      }
    }

    // Auto-sync a Google Sheets de fondo
    if (process.env.GOOGLE_SCRIPT_URL) {
      runGoogleSheetsSync().catch(console.error);
    }

    return NextResponse.json({ message: 'Jornada guardada correctamente', status: 'success' });
  } catch (error) {
    console.error('Error saving tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
