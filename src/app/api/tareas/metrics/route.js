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
         COUNT(CASE WHEN (LOWER(COALESCE(t.nature, '')) LIKE '%falla%' OR COALESCE(t.stop_time_minutes, 0) > 0 OR t.affects_availability = true) THEN 1 END)::int as failure_interventions,
         COALESCE(SUM(CASE WHEN (LOWER(COALESCE(t.nature, '')) LIKE '%falla%' OR COALESCE(t.stop_time_minutes, 0) > 0 OR t.affects_availability = true) THEN GREATEST(COALESCE(t.stop_time_minutes, 0), COALESCE(t.total_time_minutes, 0)) ELSE 0 END), 0)::int as failure_stop_minutes,
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

    const plantFailuresRes = await query(
      `SELECT 
         COUNT(t.id)::int as total_failure_interventions,
         COALESCE(SUM(CASE WHEN COALESCE(t.stop_time_minutes, 0) > 0 THEN t.stop_time_minutes ELSE COALESCE(t.total_time_minutes, 0) END), 0)::int as total_failure_stop_minutes
       FROM tasks t
       WHERE t.status = 'APPROVED'
         AND ($1 = 'ALL' OR t.plant = $1)
         AND t.task_date >= $2 AND t.task_date <= $3
         AND (LOWER(COALESCE(t.nature, '')) LIKE '%falla%' OR COALESCE(t.stop_time_minutes, 0) > 0 OR t.affects_availability = true)`,
      [plant, startDateStr, endDateStr]
    );

    const downtimeMap = {};
    machineDowntimeRes.rows.forEach(r => {
      downtimeMap[r.machine_id] = {
        interventions: r.total_interventions,
        failure_interventions: r.failure_interventions,
        failure_stop_minutes: r.failure_stop_minutes,
        stop_minutes: r.total_stop_minutes,
        work_minutes: r.total_work_minutes
      };
    });

    // 4. Calcular la disponibilidad, TMDR y TMEF de cada máquina
    const unconfiguredMachines = [];
    const machinesAvailabilityList = machines.map(m => {
      const dailyHours = getDailyProductiveHours(m.productive_start, m.productive_end);
      const isConfigured = dailyHours !== null;

      if (!isConfigured) {
        unconfiguredMachines.push(m.name);
      }

      const totalAvailableHours = isConfigured ? dailyHours * totalBusinessDays : 0;
      const dtInfo = downtimeMap[m.id] || { interventions: 0, failure_interventions: 0, failure_stop_minutes: 0, stop_minutes: 0, work_minutes: 0 };
      const stopHours = dtInfo.stop_minutes / 60;
      const operatingHours = isConfigured ? Math.max(0, totalAvailableHours - stopHours) : 0;

      let availabilityPct = null;
      if (isConfigured && totalAvailableHours > 0) {
        availabilityPct = Math.max(0, Math.min(100, ((totalAvailableHours - stopHours) / totalAvailableHours) * 100));
      }

      const failureCount = dtInfo.failure_interventions || 0;
      const failureStopMins = dtInfo.failure_stop_minutes || 0;

      // TMDR: minutos totales de parada por falla / intervenciones correctivas
      const tmdrMinutes = failureCount > 0 ? parseFloat((failureStopMins / failureCount).toFixed(1)) : 0;
      const tmdrHours = failureCount > 0 ? parseFloat(((failureStopMins / 60.0) / failureCount).toFixed(2)) : 0;

      // TMEF: tiempo total operativo de la máquina / paradas por falla
      const tmefHours = failureCount > 0 
        ? parseFloat((operatingHours / failureCount).toFixed(1)) 
        : (operatingHours > 0 ? parseFloat(operatingHours.toFixed(1)) : null);

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
        operating_hours: parseFloat(operatingHours.toFixed(1)),
        interventions: dtInfo.interventions,
        failure_interventions: failureCount,
        failure_stop_minutes: failureStopMins,
        tmdr_minutes: tmdrMinutes,
        tmdr_hours: tmdrHours,
        tmef_hours: tmefHours,
        work_minutes: dtInfo.work_minutes,
        availability_pct: availabilityPct !== null ? parseFloat(availabilityPct.toFixed(2)) : null
      };
    });

    // 5. Cálculos específicos para los KPIs de las plantas (SL2 y SL1)
    const findMachAvail = (pattern) => {
      const match = machinesAvailabilityList.find(m => m.name.toUpperCase().includes(pattern.toUpperCase()));
      return match ? match : null;
    };

    // KPIs SL2
    const kpiFL02 = findMachAvail('FL02');
    const kpiM01 = findMachAvail('M01');
    const kpiM03 = findMachAvail('M03');
    const kpiM05 = findMachAvail('M05');
    const kpiM06 = findMachAvail('M06');
    const kpiM07 = findMachAvail('M07');
    const kpiP05 = findMachAvail('P05');
    const kpiP06 = findMachAvail('P06');

    let kpiMediaP05P06 = null;
    const availP05 = kpiP05?.availability_pct;
    const availP06 = kpiP06?.availability_pct;
    if (availP05 !== null && availP05 !== undefined && availP06 !== null && availP06 !== undefined) {
      kpiMediaP05P06 = parseFloat(((availP05 + availP06) / 2).toFixed(2));
    } else if (availP05 !== null && availP05 !== undefined) {
      kpiMediaP05P06 = availP05;
    } else if (availP06 !== null && availP06 !== undefined) {
      kpiMediaP05P06 = availP06;
    }

    // KPIs SL1 - Planta
    const kpiH08 = findMachAvail('H08');
    const kpiH09 = findMachAvail('H09');
    const kpiMEP02 = findMachAvail('MEP02') || findMachAvail('MEP');
    const kpiP08_SL1 = findMachAvail('P08');
    const kpiP09_SL1 = findMachAvail('P09');

    let kpiMediaP08P09_SL1 = null;
    const availP08_SL1 = kpiP08_SL1?.availability_pct;
    const availP09_SL1 = kpiP09_SL1?.availability_pct;
    if (availP08_SL1 !== null && availP08_SL1 !== undefined && availP09_SL1 !== null && availP09_SL1 !== undefined) {
      kpiMediaP08P09_SL1 = parseFloat(((availP08_SL1 + availP09_SL1) / 2).toFixed(2));
    } else if (availP08_SL1 !== null && availP08_SL1 !== undefined) {
      kpiMediaP08P09_SL1 = availP08_SL1;
    } else if (availP09_SL1 !== null && availP09_SL1 !== undefined) {
      kpiMediaP08P09_SL1 = availP09_SL1;
    }

    // KPIs SL1 - Sucursal comercial San Luis
    const kpiR39 = findMachAvail('R39');
    const kpiR40 = findMachAvail('R40');
    const kpiR43 = findMachAvail('R43');
    const kpiR44 = findMachAvail('R44');
    const kpiQ03 = findMachAvail('Q03');
    const kpiS09 = findMachAvail('S09');
    const kpiS14 = findMachAvail('S14');

    // Tejedoras (SL1)
    const tejedoras = machinesAvailabilityList.filter(m => 
      m.name.toLowerCase().includes('tejedora') || (m.sector && m.sector.toLowerCase().includes('tejedora'))
    );
    let kpiMenorTejedoras = null;
    let kpiMenorTejedoraNombre = null;
    const validTejedoras = tejedoras.filter(m => m.availability_pct !== null && m.availability_pct !== undefined);
    if (validTejedoras.length > 0) {
      validTejedoras.sort((a, b) => a.availability_pct - b.availability_pct);
      kpiMenorTejedoras = validTejedoras[0].availability_pct;
      kpiMenorTejedoraNombre = validTejedoras[0].name;
    }

    // Puentes Grúas
    const puentesGruas = machinesAvailabilityList.filter(m => 
      m.name.toLowerCase().includes('puente') || (m.sector && m.sector.toLowerCase().includes('puente'))
    );
    let kpiMenorPuentesGruas = null;
    let kpiMenorPuenteGruaNombre = null;
    const validPuentes = puentesGruas.filter(m => m.availability_pct !== null && m.availability_pct !== undefined);
    if (validPuentes.length > 0) {
      validPuentes.sort((a, b) => a.availability_pct - b.availability_pct);
      kpiMenorPuentesGruas = validPuentes[0].availability_pct;
      kpiMenorPuenteGruaNombre = validPuentes[0].name;
    }

    // Autoelevadores SL2 (filtro por nombre genérico)
    const autoelevadores = machinesAvailabilityList.filter(m => 
      m.name.toLowerCase().includes('autoelevador') || (m.sector && m.sector.toLowerCase().includes('autoelevador'))
    );
    let kpiMediaAutoelevadores = null;
    const validAutoAvail = autoelevadores.map(m => m.availability_pct).filter(v => v !== null && v !== undefined);
    if (validAutoAvail.length > 0) {
      const sumAuto = validAutoAvail.reduce((acc, curr) => acc + curr, 0);
      kpiMediaAutoelevadores = parseFloat((sumAuto / validAutoAvail.length).toFixed(2));
    }

    // Autoelevadores SL1 — S16 y SA02 específicamente
    const kpiS16 = findMachAvail('S16');
    const kpiSA02 = findMachAvail('SA02');
    const autoelevadoresSL1 = [kpiS16, kpiSA02].filter(m => m !== null && m !== undefined);
    let kpiMediaAutoelevadoresSL1 = null;
    const validAutoSL1 = autoelevadoresSL1.map(m => m.availability_pct).filter(v => v !== null && v !== undefined);
    if (validAutoSL1.length > 0) {
      const sumAutoSL1 = validAutoSL1.reduce((acc, curr) => acc + curr, 0);
      kpiMediaAutoelevadoresSL1 = parseFloat((sumAutoSL1 / validAutoSL1.length).toFixed(2));
    }

    // KPIs RAM
    const kpiH06 = findMachAvail('H06');
    const kpiREC01 = findMachAvail('REC01');
    const kpiREC02 = findMachAvail('REC02');
    const kpiMEP01 = findMachAvail('MEP01');
    const kpiP04 = findMachAvail('P04');
    const kpiTR02 = findMachAvail('TR02');
    const kpiTR03 = findMachAvail('TR03');
    const kpiTR04 = findMachAvail('TR04');
    const kpiDRUIDS01 = findMachAvail('DRUIDS01') || findMachAvail('DRUIDS');

    // Media REC01-REC02
    let kpiMediaREC01REC02 = null;
    const availREC01 = kpiREC01?.availability_pct;
    const availREC02 = kpiREC02?.availability_pct;
    if (availREC01 !== null && availREC01 !== undefined && availREC02 !== null && availREC02 !== undefined) {
      kpiMediaREC01REC02 = parseFloat(((availREC01 + availREC02) / 2).toFixed(2));
    } else if (availREC01 !== null && availREC01 !== undefined) {
      kpiMediaREC01REC02 = availREC01;
    } else if (availREC02 !== null && availREC02 !== undefined) {
      kpiMediaREC01REC02 = availREC02;
    }

    // Autoelevadores RAM — S05, S06, S07 específicamente
    const kpiS05 = findMachAvail('S05');
    const kpiS06 = findMachAvail('S06');
    const kpiS07 = findMachAvail('S07');
    const autoelevadoresRAM = [kpiS05, kpiS06, kpiS07].filter(m => m !== null && m !== undefined);
    let kpiMediaAutoelevadoresRAM = null;
    const validAutoRAM = autoelevadoresRAM.map(m => m.availability_pct).filter(v => v !== null && v !== undefined);
    if (validAutoRAM.length > 0) {
      const sumAutoRAM = validAutoRAM.reduce((acc, curr) => acc + curr, 0);
      kpiMediaAutoelevadoresRAM = parseFloat((sumAutoRAM / validAutoRAM.length).toFixed(2));
    }

    // Consulta de paradas específicas por líneas para DRUIDS01 (RAM)
    // Buscamos el objeto de máquina ya cargado para evitar JOIN con posible incompatibilidad de tipos
    const druidsMachineObj = machines.find(m => m.name && m.name.toUpperCase().includes('DRUIDS'));

    let druidsLineBreakdown = [];
    let kpiDRUIDS01_Final = null;

    if (druidsMachineObj) {
      let druidsTasksRows = [];
      try {
        const druidsTasksRes = await query(
          `SELECT stop_time_minutes, affected_lines, description
           FROM tasks
           WHERE status = 'APPROVED'
             AND machine_id = $1
             AND task_date >= $2 AND task_date <= $3`,
          [druidsMachineObj.id, startDateStr, endDateStr]
        );
        druidsTasksRows = druidsTasksRes.rows;
      } catch(e) {
        console.error('Error fetching DRUIDS01 tasks:', e.message);
      }

      const druidsLineStopMinutes = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0 };
      let druidsFullEquipoStopMinutes = 0;

      druidsTasksRows.forEach(r => {
        const stopMins = parseInt(r.stop_time_minutes || 0, 10);
        if (stopMins <= 0) return;

        // Parsear affected_lines desde JSON si es string, o usarlo directamente
        let affLines = [];
        try {
          affLines = typeof r.affected_lines === 'string'
            ? JSON.parse(r.affected_lines)
            : (Array.isArray(r.affected_lines) ? r.affected_lines : []);
        } catch(e) { affLines = []; }

        const affText = (affLines.join(' ') + ' ' + (r.description || '')).toLowerCase();
        const isFullEquipo = affText.includes('equipo completo') || affText.includes('todo el equipo');

        if (isFullEquipo) {
          // Opción B: Resta horas únicamente al indicador general de la máquina
          druidsFullEquipoStopMinutes += stopMins;
        } else {
          let foundLine = false;
          for (let i = 1; i <= 8; i++) {
            if (affText.includes(`línea ${i}`) || affText.includes(`linea ${i}`)) {
              druidsLineStopMinutes[i] += stopMins;
              foundLine = true;
            }
          }
          // Si la tarea no indicó línea específica, afecta el general
          if (!foundLine) {
            druidsFullEquipoStopMinutes += stopMins;
          }
        }
      });

      const druidsMachineAvail = findMachAvail('DRUIDS01') || findMachAvail('DRUIDS');
      if (druidsMachineAvail && druidsMachineAvail.is_configured && druidsMachineAvail.total_available_hours > 0) {
        const totalAvailHs = druidsMachineAvail.total_available_hours;

        let sumLinePcts = 0;
        for (let i = 1; i <= 8; i++) {
          const lineStopHs = (druidsLineStopMinutes[i] || 0) / 60.0;
          const linePct = Math.max(0, Math.min(100, ((totalAvailHs - lineStopHs) / totalAvailHs) * 100));
          const roundedLinePct = parseFloat(linePct.toFixed(2));
          sumLinePcts += roundedLinePct;
          druidsLineBreakdown.push({
            line: `Línea ${i}`,
            availability_pct: roundedLinePct,
            stop_hours: parseFloat(lineStopHs.toFixed(2))
          });
        }

        const lineAvgPct = sumLinePcts / 8.0;
        const fullEquipoStopHs = druidsFullEquipoStopMinutes / 60.0;
        const fullEquipoPenaltyPct = (fullEquipoStopHs / totalAvailHs) * 100;

        const finalGeneralPct = Math.max(0, Math.min(100, lineAvgPct - fullEquipoPenaltyPct));
        kpiDRUIDS01_Final = parseFloat(finalGeneralPct.toFixed(2));
      }
    }

    // KPIs PIL
    const kpiP10 = findMachAvail('P10');
    const kpiS11 = findMachAvail('S11');

    // KPIs CBA (48 Máquinas)
    const cbaCodes = [
      'H01','H02','H03','H04','H07','P03','T01','S02','S03','S04','PL01',
      'SR01','SR07','SR11','SR13','SR02','SR03','U01','G07','Q01','Q02',
      'R03','R04','R05','R06','R20','R21','R22','R07','R08','R09','R10',
      'R11','R12','R13','R14','R15','R16','R17','R18','R19','R23','R24',
      'UR07','UR13','UR15','UR16','X100'
    ];
    const cbaKpisObj = {};
    cbaCodes.forEach(code => {
      const match = findMachAvail(code);
      cbaKpisObj[code] = match ? match.availability_pct : null;
    });

    // 6. Horas Hombre (HH) Metrics - PARTICIÓN COMPLETA SIN PÉRDIDA DE HORAS
    // Auto-corregir man_hours desfasados tras ediciones de horario
    try {
      await query(`
        UPDATE tasks 
        SET man_hours = (total_time_minutes / 60.0) * (
          CASE 
            WHEN companions IS NOT NULL AND jsonb_typeof(companions::jsonb) = 'array' 
            THEN jsonb_array_length(companions::jsonb) + 1 
            ELSE 1 
          END
        )
        WHERE total_time_minutes IS NOT NULL;
      `);
    } catch(e) {}

    const hhRes = await query(
      `SELECT 
         t.task_type,
         t.nature,
         t.category,
         t.man_hours,
         t.total_time_minutes,
         t.companions
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

    const hhPreventivoBreakdown = {};
    const hhVariosBreakdown = {};
    const hhAusentismoBreakdown = {};

    const PREVENTIVE_PATTERNS = [
      'preventivo', 'preventivos', 'condicional', 'semanal', 'mensual', 'trimestral', 'semestral', 'anual',
      'inspeccion', 'inspección', 'mejora', 'mejoras', 'montaje'
    ];

    hhRes.rows.forEach(r => {
      let compsCount = 0;
      if (r.companions) {
        try {
          const comps = typeof r.companions === 'string' ? JSON.parse(r.companions) : r.companions;
          if (Array.isArray(comps)) compsCount = comps.length;
        } catch (e) {}
      }

      // Calcular horas de esta tarea (usar minutos reales ajustados por operarios acompañantes)
      let taskHH = 0;
      if (r.total_time_minutes !== null && r.total_time_minutes !== undefined && !isNaN(parseFloat(r.total_time_minutes))) {
        taskHH = (parseFloat(r.total_time_minutes) / 60.0) * (compsCount + 1);
      } else if (r.man_hours !== null && r.man_hours !== undefined && !isNaN(parseFloat(r.man_hours))) {
        taskHH = parseFloat(r.man_hours);
      }

      const natureLower = (r.nature || '').toLowerCase();
      const typeLower = (r.task_type || '').toLowerCase();
      const catName = r.category ? r.category.trim() : 'Sin subcategoría';

      // Clasificación exhaustiva (if / else if / else if / else)
      if (typeLower.includes('ausentismo') || typeLower.includes('no productivo')) {
        // 13) Ausentismo
        hhAusentismo += taskHH;
        const ausName = r.category && r.category.trim() ? r.category.trim() : 'Sin subcategoría';
        hhAusentismoBreakdown[ausName] = (hhAusentismoBreakdown[ausName] || 0) + taskHH;
      } else if (natureLower.includes('falla')) {
        // 10) Trabajos Correctivos (Falla)
        hhCorrectivo += taskHH;
      } else if (PREVENTIVE_PATTERNS.some(p => natureLower.includes(p))) {
        // 11) Trabajos Preventivos
        hhPreventivo += taskHH;
        const prevName = r.nature && r.nature.trim() ? r.nature.trim() : (r.category && r.category.trim() ? r.category.trim() : 'Preventivo sin especificar');
        hhPreventivoBreakdown[prevName] = (hhPreventivoBreakdown[prevName] || 0) + taskHH;
      } else {
        // 12) Trabajos Varios (Mantenimiento Edilicio / Varios + tareas de máquinas con otra naturaleza)
        hhVarios += taskHH;
        const varName = r.category && r.category.trim() 
          ? r.category.trim() 
          : (r.nature && r.nature.trim() ? r.nature.trim() : (r.task_type && r.task_type.trim() ? r.task_type.trim() : 'Varios / Sin especificar'));
        hhVariosBreakdown[varName] = (hhVariosBreakdown[varName] || 0) + taskHH;
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

    // 7. Cálculo de Indicadores de Confiabilidad y Mantenibilidad (TMDR y TMEF) a nivel de planta
    let totalPlantOperatingHours = 0;
    let totalPlantAvailableHours = 0;
    machinesAvailabilityList.forEach(m => {
      if (m.is_configured && m.total_available_hours > 0) {
        totalPlantAvailableHours += m.total_available_hours;
        totalPlantOperatingHours += Math.max(0, m.total_available_hours - m.stop_hours);
      }
    });

    const plantTotalFailures = plantFailuresRes.rows[0]?.total_failure_interventions || 0;
    const plantTotalFailureStopMins = plantFailuresRes.rows[0]?.total_failure_stop_minutes || 0;

    // TMDR: minutos totales de parada por falla / intervenciones correctivas
    const plantTMDR_Minutes = plantTotalFailures > 0 ? parseFloat((plantTotalFailureStopMins / plantTotalFailures).toFixed(1)) : 0;
    const plantTMDR_Hours = plantTotalFailures > 0 ? parseFloat(((plantTotalFailureStopMins / 60.0) / plantTotalFailures).toFixed(2)) : 0;

    // TMEF: tiempo total operativo de las máquinas / paradas por falla
    const plantTMEF_Hours = plantTotalFailures > 0 
      ? parseFloat((totalPlantOperatingHours / plantTotalFailures).toFixed(1)) 
      : (totalPlantOperatingHours > 0 ? parseFloat(totalPlantOperatingHours.toFixed(1)) : null);

    const reliabilityMetrics = {
      tmdr_minutes: plantTMDR_Minutes,
      tmdr_hours: plantTMDR_Hours,
      tmef_hours: plantTMEF_Hours,
      total_failures: plantTotalFailures,
      total_stop_minutes: plantTotalFailureStopMins,
      total_operating_hours: parseFloat(totalPlantOperatingHours.toFixed(1)),
      total_available_hours: parseFloat(totalPlantAvailableHours.toFixed(1))
    };

    return NextResponse.json({
      fromMonth,
      toMonth,
      months,
      totalBusinessDays,
      monthlyDaysBreakdown,
      unconfiguredMachines,
      reliabilityMetrics,
      sl2KPIs: {
        reliabilityMetrics,
        disponibilidadFL02: kpiFL02 ? kpiFL02.availability_pct : null,
        disponibilidadM01: kpiM01 ? kpiM01.availability_pct : null,
        disponibilidadM03: kpiM03 ? kpiM03.availability_pct : null,
        disponibilidadM05: kpiM05 ? kpiM05.availability_pct : null,
        disponibilidadM06: kpiM06 ? kpiM06.availability_pct : null,
        disponibilidadM07: kpiM07 ? kpiM07.availability_pct : null,
        disponibilidadMediaP05P06: kpiMediaP05P06,
        disponibilidadMediaP08P09: kpiMediaP05P06,
        menorDisponibilidadPuentesGruas: kpiMenorPuentesGruas,
        menorPuenteGruaNombre: kpiMenorPuenteGruaNombre,
        disponibilidadMediaAutoelevadores: kpiMediaAutoelevadores,
        details: {
          FL02: kpiFL02,
          M01: kpiM01,
          M03: kpiM03,
          M05: kpiM05,
          M06: kpiM06,
          M07: kpiM07,
          P05: kpiP05,
          P06: kpiP06,
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
          pctHHAusentismo,
          preventivoBreakdown: Object.entries(hhPreventivoBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours),
          variosBreakdown: Object.entries(hhVariosBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours),
          ausentismoBreakdown: Object.entries(hhAusentismoBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours)
        }
      },
      sl1KPIs: {
        reliabilityMetrics,
        disponibilidadH08: kpiH08 ? kpiH08.availability_pct : null,
        disponibilidadH09: kpiH09 ? kpiH09.availability_pct : null,
        disponibilidadMEP02: kpiMEP02 ? kpiMEP02.availability_pct : null,
        disponibilidadMediaP08P09: kpiMediaP08P09_SL1,
        menorDisponibilidadPuentesGruas: kpiMenorPuentesGruas,
        menorPuenteGruaNombre: kpiMenorPuenteGruaNombre,
        menorDisponibilidadTejedoras: kpiMenorTejedoras,
        menorTejedoraNombre: kpiMenorTejedoraNombre,
        disponibilidadMediaAutoelevadores: kpiMediaAutoelevadoresSL1,
        // Sucursal comercial San Luis
        disponibilidadR39: kpiR39 ? kpiR39.availability_pct : null,
        disponibilidadR40: kpiR40 ? kpiR40.availability_pct : null,
        disponibilidadR43: kpiR43 ? kpiR43.availability_pct : null,
        disponibilidadR44: kpiR44 ? kpiR44.availability_pct : null,
        disponibilidadQ03: kpiQ03 ? kpiQ03.availability_pct : null,
        disponibilidadS09: kpiS09 ? kpiS09.availability_pct : null,
        disponibilidadS14: kpiS14 ? kpiS14.availability_pct : null,
        details: {
          H08: kpiH08,
          H09: kpiH09,
          MEP02: kpiMEP02,
          P08: kpiP08_SL1,
          P09: kpiP09_SL1,
          puentesGruas,
          tejedoras,
          autoelevadoresSL1,
          S16: kpiS16, SA02: kpiSA02,
          R39: kpiR39, R40: kpiR40, R43: kpiR43, R44: kpiR44,
          Q03: kpiQ03, S09: kpiS09, S14: kpiS14
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
          pctHHAusentismo,
          preventivoBreakdown: Object.entries(hhPreventivoBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours),
          variosBreakdown: Object.entries(hhVariosBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours),
          ausentismoBreakdown: Object.entries(hhAusentismoBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours)
        }
      },
      ramKPIs: {
        reliabilityMetrics,
        disponibilidadH06: kpiH06 ? kpiH06.availability_pct : null,
        disponibilidadMediaREC01REC02: kpiMediaREC01REC02,
        disponibilidadMEP01: kpiMEP01 ? kpiMEP01.availability_pct : null,
        disponibilidadP04: kpiP04 ? kpiP04.availability_pct : null,
        menorDisponibilidadPuentesGruas: kpiMenorPuentesGruas,
        menorPuenteGruaNombre: kpiMenorPuenteGruaNombre,
        disponibilidadTR02: kpiTR02 ? kpiTR02.availability_pct : null,
        disponibilidadTR03: kpiTR03 ? kpiTR03.availability_pct : null,
        disponibilidadTR04: kpiTR04 ? kpiTR04.availability_pct : null,
        disponibilidadDRUIDS01: kpiDRUIDS01_Final !== null ? kpiDRUIDS01_Final : (kpiDRUIDS01 ? kpiDRUIDS01.availability_pct : null),
        druidsLineBreakdown: druidsLineBreakdown,
        disponibilidadMediaAutoelevadores: kpiMediaAutoelevadoresRAM,
        details: {
          H06: kpiH06, REC01: kpiREC01, REC02: kpiREC02,
          MEP01: kpiMEP01, P04: kpiP04,
          TR02: kpiTR02, TR03: kpiTR03, TR04: kpiTR04,
          DRUIDS01: kpiDRUIDS01,
          puentesGruas,
          autoelevadoresRAM, S05: kpiS05, S06: kpiS06, S07: kpiS07
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
          pctHHAusentismo,
          preventivoBreakdown: Object.entries(hhPreventivoBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours),
          variosBreakdown: Object.entries(hhVariosBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours),
          ausentismoBreakdown: Object.entries(hhAusentismoBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours)
        }
      },
      pilKPIs: {
        reliabilityMetrics,
        disponibilidadP10: kpiP10 ? kpiP10.availability_pct : null,
        menorDisponibilidadPuentesGruas: kpiMenorPuentesGruas,
        menorPuenteGruaNombre: kpiMenorPuenteGruaNombre,
        disponibilidadS11: kpiS11 ? kpiS11.availability_pct : null,
        details: {
          P10: kpiP10,
          S11: kpiS11,
          puentesGruas
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
          pctHHAusentismo,
          preventivoBreakdown: Object.entries(hhPreventivoBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours),
          variosBreakdown: Object.entries(hhVariosBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours),
          ausentismoBreakdown: Object.entries(hhAusentismoBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours)
        }
      },
      cbaKPIs: {
        reliabilityMetrics,
        availabilities: cbaKpisObj,
        hhMetrics: {
          totalHHLoaded: parseFloat(totalHHLoaded.toFixed(2)),
          hhCorrectivo: parseFloat(hhCorrectivo.toFixed(2)),
          hhPreventivo: parseFloat(hhPreventivo.toFixed(2)),
          hhVarios: parseFloat(hhVarios.toFixed(2)),
          hhAusentismo: parseFloat(hhAusentismo.toFixed(2)),
          pctHHCorrectivo,
          pctHHPreventivo,
          pctHHVarios,
          pctHHAusentismo,
          preventivoBreakdown: Object.entries(hhPreventivoBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours),
          variosBreakdown: Object.entries(hhVariosBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours),
          ausentismoBreakdown: Object.entries(hhAusentismoBreakdown).map(([name, hs]) => ({ name, hours: parseFloat(hs.toFixed(2)) })).sort((a,b) => b.hours - a.hours)
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
