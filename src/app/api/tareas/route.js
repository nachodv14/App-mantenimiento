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

    const timeToMins = (timeStr) => {
      if (!timeStr) return -1;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const getSegments = (s, e) => {
      if (s < 0 || e < 0) return [];
      if (s < e) return [[s, e]];
      if (s > e) return [[s, 1440], [0, e]];
      return [];
    };

    const doOverlap = (s1, e1, s2, e2) => {
      const segs1 = getSegments(s1, e1);
      const segs2 = getSegments(s2, e2);
      for (const a of segs1) {
        for (const b of segs2) {
          if (a[0] < b[1] && b[0] < a[1]) return true;
        }
      }
      return false;
    };

    const getInvolvedUsers = (task) => {
      const users = new Set([data.operator_id]);
      if (Array.isArray(task.companions)) {
        task.companions.forEach(c => users.add(c));
      }
      return users;
    };

    // 1. Validar solapamiento interno en el payload
    for (let i = 0; i < data.tasks.length; i++) {
      const t1 = data.tasks[i];
      const u1 = getInvolvedUsers(t1);
      const s1 = timeToMins(t1.start_time);
      const e1 = timeToMins(t1.end_time);

      for (let j = i + 1; j < data.tasks.length; j++) {
        const t2 = data.tasks[j];
        const u2 = getInvolvedUsers(t2);
        
        let shareUser = false;
        for (const u of u1) {
          if (u2.has(u)) { shareUser = true; break; }
        }

        if (shareUser) {
          const s2 = timeToMins(t2.start_time);
          const e2 = timeToMins(t2.end_time);
          if (doOverlap(s1, e1, s2, e2)) {
            return NextResponse.json({ error: `Conflicto en fecha ${data.task_date}: El renglón ${i+1} (${t1.start_time} a ${t1.end_time}) y el renglón ${j+1} (${t2.start_time} a ${t2.end_time}) se superponen en horario para uno de los operarios.` }, { status: 400 });
          }
        }
      }
    }

    // 2. Validar solapamiento con base de datos (tareas ya cargadas)
    const existingRes = await query(`
      SELECT id, operator_id, companions, start_time, end_time 
      FROM tasks 
      WHERE task_date = $1 AND status != 'REJECTED'
    `, [data.task_date]);
    
    const existingTasks = existingRes.rows;

    for (let i = 0; i < data.tasks.length; i++) {
      const t1 = data.tasks[i];
      const u1 = getInvolvedUsers(t1);
      const s1 = timeToMins(t1.start_time);
      const e1 = timeToMins(t1.end_time);

      for (const exTask of existingTasks) {
        const exUsers = new Set([exTask.operator_id]);
        try {
          const exComps = typeof exTask.companions === 'string' ? JSON.parse(exTask.companions) : (exTask.companions || []);
          exComps.forEach(c => exUsers.add(c));
        } catch(e) {}

        let shareUser = false;
        for (const u of u1) {
          if (exUsers.has(u)) { shareUser = true; break; }
        }

        if (shareUser) {
          const s2 = timeToMins(exTask.start_time);
          const e2 = timeToMins(exTask.end_time);
          if (doOverlap(s1, e1, s2, e2)) {
            const exStart = exTask.start_time ? exTask.start_time.substring(0, 5) : '';
            const exEnd = exTask.end_time ? exTask.end_time.substring(0, 5) : '';
            return NextResponse.json({ error: `Conflicto en fecha ${data.task_date}: El renglón ${i+1} (${t1.start_time} a ${t1.end_time}) se solapa con una tarea ya registrada en la base de datos (de ${exStart} a ${exEnd}) para uno de los operarios.` }, { status: 400 });
          }
        }
      }
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

    const calculateProductiveDowntime = (faultStart, faultEnd, prodStartStr, prodEndStr) => {
      if (!prodStartStr || !prodEndStr) return 0; // Si no hay horario, se asume 0 productiva
      if (isNaN(faultStart.getTime()) || isNaN(faultEnd.getTime())) return 0;
      if (faultStart >= faultEnd) return 0;

      const parseTime = (str) => {
        const [h, m] = str.split(':').map(Number);
        return h * 60 + m;
      };

      const ps = parseTime(prodStartStr);
      const pe = parseTime(prodEndStr);

      const getProductiveSegmentsForDay = () => {
        if (ps <= pe) {
          return [[ps, pe]];
        } else {
          return [[0, pe], [ps, 1440]];
        }
      };
      const prodSegments = getProductiveSegmentsForDay();

      const getArgMidnight = (d) => {
        const argTime = d.getTime() - (3 * 60 * 60 * 1000);
        const argDate = new Date(argTime);
        argDate.setUTCHours(24, 0, 0, 0);
        return new Date(argDate.getTime() + (3 * 60 * 60 * 1000));
      };

      const getArgMins = (d) => {
        const argTime = d.getTime() - (3 * 60 * 60 * 1000);
        const argDate = new Date(argTime);
        return argDate.getUTCHours() * 60 + argDate.getUTCMinutes() + argDate.getUTCSeconds() / 60;
      };

      let totalDowntime = 0;
      let currentStart = new Date(faultStart);
      
      while (currentStart < faultEnd) {
        let currentDayEnd = getArgMidnight(currentStart);
        
        let currentSegmentEnd = currentDayEnd < faultEnd ? currentDayEnd : faultEnd;
        
        const startMins = getArgMins(currentStart);
        const endMins = getArgMins(currentSegmentEnd);
        
        const actualEndMins = (endMins === 0 && currentSegmentEnd > currentStart) ? 1440 : endMins;

        for (const [pStart, pEnd] of prodSegments) {
          const overlapStart = Math.max(startMins, pStart);
          const overlapEnd = Math.min(actualEndMins, pEnd);
          if (overlapStart < overlapEnd) {
            totalDowntime += (overlapEnd - overlapStart);
          }
        }
        currentStart = currentDayEnd;
      }
      return Math.round(totalDowntime);
    };

    // Obtener configuración de máquinas para la disponibilidad
    const machineIds = data.tasks.filter(t => t.machine_id).map(t => t.machine_id);
    let machineConfigs = {};
    if (machineIds.length > 0) {
      const mcRes = await query(`SELECT id, productive_start, productive_end FROM machines WHERE id = ANY($1)`, [machineIds]);
      mcRes.rows.forEach(r => {
        machineConfigs[r.id] = r;
      });
    }

    // Guardar cada tarea en la DB
    for (const t of data.tasks) {
      const totalMinutes = calculateMinutes(t.start_time, t.end_time);
      const companionsCount = Array.isArray(t.companions) ? t.companions.length : 0;
      const manHours = totalMinutes ? (totalMinutes / 60) * (companionsCount + 1) : null;
      
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

      let stopTimeMinutes = null;
      if (t.affects_availability && taskStartOutTime && taskEndOutTime && t.machine_id) {
        const mc = machineConfigs[t.machine_id] || {};
        stopTimeMinutes = calculateProductiveDowntime(new Date(taskStartOutTime), new Date(taskEndOutTime), mc.productive_start, mc.productive_end);
      }

      let finalDescription = t.description || '';
      let finalDeviation = t.deviation || null;

      if (t.affected_lines && Array.isArray(t.affected_lines) && t.affected_lines.length > 0) {
        const linesText = `\n[Líneas afectadas: ${t.affected_lines.join(', ')}]`;
        finalDescription += linesText;
        if (finalDeviation) finalDeviation += linesText;
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
        finalDescription,
        t.record_type,
        t.category || null,
        t.machine_id || null,
        t.nature || null,
        finalDeviation,
        t.observaciones || null,
        t.affects_availability || false,
        t.final_state || null,
        'PENDING',
        taskStartOutTime,
        taskEndOutTime,
        stopTimeMinutes
      ];

      const insertResult = await query(text, params);
      const taskId = insertResult.rows[0].id;

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
          `, [data.plant, t.machine_id, data.operator_id, outStartTime, finalDeviation || finalDescription]);
        } else if (t.final_state === 'Funcional') {
          // La máquina se arregló: Tomar la hora manual ingresada o la de fin de tarea
          let resolutionTime = taskEndOutTime;
          if (!resolutionTime) {
            try {
              resolutionTime = new Date(`${data.task_date}T${t.end_time}:00-03:00`).toISOString();
            } catch (e) {
              resolutionTime = new Date().toISOString();
            }
          }

          // Buscar cuándo fue reportada la falla
          const resMachine = await query(`SELECT start_time FROM machines_out_of_service WHERE machine_id = $1 AND is_resolved = false`, [t.machine_id]);
          
          await query(`UPDATE machines_out_of_service SET is_resolved = true, resolved_at = $2 WHERE machine_id = $1 AND is_resolved = false`, [t.machine_id, resolutionTime]);
          
          if (resMachine.rows.length > 0) {
            const outStartTime = resMachine.rows[0].start_time;
            
            const mc = machineConfigs[t.machine_id] || {};
            const resolutionStopTime = calculateProductiveDowntime(new Date(outStartTime), new Date(resolutionTime), mc.productive_start, mc.productive_end);
            
            // Poner TODOS los datos de la parada en la tarea ACTUAL (la de reparación)
            await query(`
              UPDATE tasks 
              SET start_out_time = $1, 
                  end_out_time = $2, 
                  stop_time_minutes = $4
              WHERE id = $3
            `, [outStartTime, resolutionTime, taskId, resolutionStopTime]);
          }
        }
      }
    }

    // 6. Lanzar la sincronización a Google Sheets en background y pasar la planta
    runGoogleSheetsSync(data.plant).catch(console.error);

    return NextResponse.json({ message: 'Jornada guardada correctamente', status: 'success' });
  } catch (error) {
    console.error('Error saving tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
