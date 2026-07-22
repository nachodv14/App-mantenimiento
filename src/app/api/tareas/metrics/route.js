import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

function getDefaultBusinessDays(yearMonthStr) {
  const [yearStr, monthStr] = yearMonthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month)) return 20;

  const daysInMonth = new Date(year, month, 0).getDate();
  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
  }
  return count;
}

function getDailyProductiveHours(startStr, endStr) {
  if (!startStr || !endStr) return null;
  const [sh, sm] = startStr.split(':').map(Number);
  const [eh, em] = endStr.split(':').map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return null;

  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60; // Cruce de medianoche
  return diff / 60;
}

function getMonthsList(fromMonth, toMonth) {
  const list = [];
  let [currY, currM] = fromMonth.split('-').map(Number);
  const [endY, endM] = toMonth.split('-').map(Number);

  while (currY < endY || (currY === endY && currM <= endM)) {
    const mStr = String(currM).padStart(2, '0');
    list.push(`${currY}-${mStr}`);
    currM++;
    if (currM > 12) {
      currM = 1;
      currY++;
    }
  }
  return list;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const plant = searchParams.get('plant');

  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const fromMonth = searchParams.get('fromMonth') || currentYM;
  const toMonth = searchParams.get('toMonth') || fromMonth;

  if (!plant) {
    return NextResponse.json({ error: 'Planta requerida' }, { status: 400 });
  }

  try {
    const months = getMonthsList(fromMonth, toMonth);

    // 1. Obtener días hábiles guardados o por defecto para cada mes del rango
    const dbDaysRes = await query(
      `SELECT year_month, business_days FROM monthly_business_days WHERE plant = $1 AND year_month = ANY($2)`,
      [plant, months]
    );

    const savedDaysMap = {};
    dbDaysRes.rows.forEach(r => {
      savedDaysMap[r.year_month] = r.business_days;
    });

    let totalBusinessDays = 0;
    const monthlyDaysBreakdown = {};
    months.forEach(ym => {
      const days = savedDaysMap[ym] !== undefined ? savedDaysMap[ym] : getDefaultBusinessDays(ym);
      monthlyDaysBreakdown[ym] = days;
      totalBusinessDays += days;
    });

    // Rango de fechas SQL
    const [fromY, fromM] = fromMonth.split('-');
    const startDateStr = `${fromY}-${fromM}-01`;
    const [toY, toM] = toMonth.split('-');
    const lastDayOfMonth = new Date(parseInt(toY, 10), parseInt(toM, 10), 0).getDate();
    const endDateStr = `${toY}-${toM}-${String(lastDayOfMonth).padStart(2, '0')}`;

    // 2. Obtener todas las máquinas activas de la planta
    const machinesRes = await query(
      `SELECT id, name, sector, productive_start, productive_end 
       FROM machines 
       WHERE plant = $1 AND is_active = true 
       ORDER BY name ASC`,
      [plant]
    );
    const machines = machinesRes.rows;

    // 3. Obtener paradas e intervenciones de máquinas (Approved tasks)
    const machineDowntimeRes = await query(
      `SELECT 
         t.machine_id,
         COUNT(t.id)::int as total_interventions,
         COALESCE(SUM(t.stop_time_minutes), 0)::int as total_stop_minutes,
         COALESCE(SUM(t.total_time_minutes), 0)::int as total_work_minutes
       FROM tasks t
       WHERE t.status = 'APPROVED'
         AND ($1 = 'ALL' OR t.plant = $1)
         AND t.task_date >= $2 AND t.task_date <= $3
         AND t.machine_id IS NOT NULL
       GROUP BY t.machine_id`,
      [plant, startDateStr, endDateStr]
    );

    const downtimeMap = {};
    machineDowntimeRes.rows.forEach(r => {
      downtimeMap[r.machine_id] = {
        interventions: r.total_interventions,
        stop_minutes: r.total_stop_minutes,
        work_minutes: r.total_work_minutes
      };
    });

    // 4. Calcular la disponibilidad de cada máquina
    const unconfiguredMachines = [];
    const machinesAvailabilityList = machines.map(m => {
      const dailyHours = getDailyProductiveHours(m.productive_start, m.productive_end);
      const isConfigured = dailyHours !== null;

      if (!isConfigured) {
        unconfiguredMachines.push(m.name);
      }

      const totalAvailableHours = isConfigured ? dailyHours * totalBusinessDays : 0;
      const dtInfo = downtimeMap[m.id] || { interventions: 0, stop_minutes: 0, work_minutes: 0 };
      const stopHours = dtInfo.stop_minutes / 60;

      let availabilityPct = null;
      if (isConfigured && totalAvailableHours > 0) {
        availabilityPct = Math.max(0, Math.min(100, ((totalAvailableHours - stopHours) / totalAvailableHours) * 100));
      }

      return {
        id: m.id,
        name: m.name,
        sector: m.sector,
        productive_start: m.productive_start,
        productive_end: m.productive_end,
        is_configured: isConfigured,
        daily_hours: dailyHours,
        total_available_hours: totalAvailableHours,
        stop_hours: stopHours,
        interventions: dtInfo.interventions,
        work_minutes: dtInfo.work_minutes,
        availability_pct: availabilityPct !== null ? parseFloat(availabilityPct.toFixed(2)) : null
      };
    });

    // 5. Cálculos específicos para los KPIs de la planta SL2
    const findMachAvail = (pattern) => {
      const match = machinesAvailabilityList.find(m => m.name.toUpperCase().includes(pattern.toUpperCase()));
      return match ? match : null;
    };

    const kpiFL02 = findMachAvail('FL02');
    const kpiM01 = findMachAvail('M01');
    const kpiM03 = findMachAvail('M03');
    const kpiM05 = findMachAvail('M05');
    const kpiM06 = findMachAvail('M06');
    const kpiM07 = findMachAvail('M07');
    const kpiP08 = findMachAvail('P08');
    const kpiP09 = findMachAvail('P09');

    // Media P08-P09
    let kpiMediaP08P09 = null;
    const availP08 = kpiP08?.availability_pct;
    const availP09 = kpiP09?.availability_pct;
    if (availP08 !== null && availP08 !== undefined && availP09 !== null && availP09 !== undefined) {
      kpiMediaP08P09 = parseFloat(((availP08 + availP09) / 2).toFixed(2));
    } else if (availP08 !== null && availP08 !== undefined) {
      kpiMediaP08P09 = availP08;
    } else if (availP09 !== null && availP09 !== undefined) {
      kpiMediaP08P09 = availP09;
    }

    // Puentes Grúas
    const puentesGruas = machinesAvailabilityList.filter(m => 
      m.name.toLowerCase().includes('puente') || (m.sector && m.sector.toLowerCase().includes('puente'))
    );
    let kpiMenorPuentesGruas = null;
    const validPuentesAvail = puentesGruas.map(m => m.availability_pct).filter(v => v !== null && v !== undefined);
    if (validPuentesAvail.length > 0) {
      kpiMenorPuentesGruas = Math.min(...validPuentesAvail);
    }

    // Autoelevadores
    const autoelevadores = machinesAvailabilityList.filter(m => 
      m.name.toLowerCase().includes('autoelevador') || (m.sector && m.sector.toLowerCase().includes('autoelevador'))
    );
    let kpiMediaAutoelevadores = null;
    const validAutoAvail = autoelevadores.map(m => m.availability_pct).filter(v => v !== null && v !== undefined);
    if (validAutoAvail.length > 0) {
      const sumAuto = validAutoAvail.reduce((acc, curr) => acc + curr, 0);
      kpiMediaAutoelevadores = parseFloat((sumAuto / validAutoAvail.length).toFixed(2));
    }

    // 6. Horas Hombre (HH) Metrics - PARTICIÓN COMPLETA SIN PÉRDIDA DE HORAS
    const hhRes = await query(
      `SELECT 
         t.task_type,
         t.nature,
         t.man_hours,
         t.total_time_minutes
       FROM tasks t
       WHERE t.status = 'APPROVED'
         AND ($1 = 'ALL' OR t.plant = $1)
         AND t.task_date >= $2 AND t.task_date <= $3`,
      [plant, startDateStr, endDateStr]
    );

    let hhCorrectivo = 0;
    let hhPreventivo = 0;
    let hhVarios = 0;
    let hhAusentismo = 0;

    const PREVENTIVE_PATTERNS = [
      'preventivo', 'preventivos', 'condicional', 'semanal', 'mensual', 'trimestral', 'semestral', 'anual'
    ];

    hhRes.rows.forEach(r => {
      // Calcular horas de esta tarea (preferir man_hours, si es null usar total_time_minutes / 60)
      let taskHH = 0;
      if (r.man_hours !== null && r.man_hours !== undefined && !isNaN(parseFloat(r.man_hours))) {
        taskHH = parseFloat(r.man_hours);
      } else if (r.total_time_minutes !== null && r.total_time_minutes !== undefined) {
        taskHH = parseFloat(r.total_time_minutes) / 60.0;
      }

      const natureLower = (r.nature || '').toLowerCase();
      const typeLower = (r.task_type || '').toLowerCase();

      // Clasificación exhaustiva (if / else if / else if / else)
      if (typeLower.includes('ausentismo') || typeLower.includes('no productivo')) {
        // 13) Ausentismo
        hhAusentismo += taskHH;
      } else if (natureLower.includes('falla')) {
        // 10) Trabajos Correctivos (Falla)
        hhCorrectivo += taskHH;
      } else if (PREVENTIVE_PATTERNS.some(p => natureLower.includes(p))) {
        // 11) Trabajos Preventivos
        hhPreventivo += taskHH;
      } else {
        // 12) Trabajos Varios (Mantenimiento Edilicio / Varios + cualquier otra naturaleza de máquina no clasificada)
        hhVarios += taskHH;
      }
    });

    const totalHHLoaded = hhCorrectivo + hhPreventivo + hhVarios + hhAusentismo;

    const pctHHCorrectivo = totalHHLoaded > 0 ? parseFloat(((hhCorrectivo / totalHHLoaded) * 100).toFixed(2)) : 0;
    const pctHHPreventivo = totalHHLoaded > 0 ? parseFloat(((hhPreventivo / totalHHLoaded) * 100).toFixed(2)) : 0;
    const pctHHVarios = totalHHLoaded > 0 ? parseFloat(((hhVarios / totalHHLoaded) * 100).toFixed(2)) : 0;
    const pctHHAusentismo = totalHHLoaded > 0 ? parseFloat(((hhAusentismo / totalHHLoaded) * 100).toFixed(2)) : 0;

    // Métricas por operario (conservado para compatibilidad)
    const qOperators = `
      SELECT 
        o.full_name as operator_name,
        COUNT(t.id)::int as total_tasks,
        COALESCE(SUM(t.total_time_minutes), 0)::int as total_minutes,
        COALESCE(SUM(COALESCE(t.man_hours, t.total_time_minutes / 60.0)), 0) as total_hh
      FROM tasks t
      JOIN users o ON t.operator_id = o.id
      WHERE t.status = 'APPROVED'
        AND ($1 = 'ALL' OR t.plant = $1)
        AND t.task_date >= $2 AND t.task_date <= $3
      GROUP BY o.full_name
      ORDER BY total_minutes DESC NULLS LAST
    `;
    const resOp = await query(qOperators, [plant, startDateStr, endDateStr]);

    return NextResponse.json({
      fromMonth,
      toMonth,
      months,
      totalBusinessDays,
      monthlyDaysBreakdown,
      unconfiguredMachines,
      sl2KPIs: {
        disponibilidadFL02: kpiFL02 ? kpiFL02.availability_pct : null,
        disponibilidadM01: kpiM01 ? kpiM01.availability_pct : null,
        disponibilidadM03: kpiM03 ? kpiM03.availability_pct : null,
        disponibilidadM05: kpiM05 ? kpiM05.availability_pct : null,
        disponibilidadM06: kpiM06 ? kpiM06.availability_pct : null,
        disponibilidadM07: kpiM07 ? kpiM07.availability_pct : null,
        disponibilidadMediaP08P09: kpiMediaP08P09,
        menorDisponibilidadPuentesGruas: kpiMenorPuentesGruas,
        disponibilidadMediaAutoelevadores: kpiMediaAutoelevadores,
        details: {
          FL02: kpiFL02,
          M01: kpiM01,
          M03: kpiM03,
          M05: kpiM05,
          M06: kpiM06,
          M07: kpiM07,
          P08: kpiP08,
          P09: kpiP09,
          puentesGruas,
          autoelevadores
        },
        hhMetrics: {
          totalHHLoaded: parseFloat(totalHHLoaded.toFixed(2)),
          hhCorrectivo: parseFloat(hhCorrectivo.toFixed(2)),
          hhPreventivo: parseFloat(hhPreventivo.toFixed(2)),
          hhVarios: parseFloat(hhVarios.toFixed(2)),
          hhAusentismo: parseFloat(hhAusentismo.toFixed(2)),
          pctHHCorrectivo,
          pctHHPreventivo,
          pctHHVarios,
          pctHHAusentismo
        }
      },
      machinesAvailabilityList,
      operatorMetrics: resOp.rows,
      machineMetrics: machinesAvailabilityList
        .filter(m => m.interventions > 0)
        .sort((a, b) => b.interventions - a.interventions)
        .slice(0, 10)
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
