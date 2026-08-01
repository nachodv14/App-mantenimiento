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

    // 6. Horas Hombre (HH) Metrics - PARTICIÓN COMPLETA SIN PÉRDIDA DE HORAS
    const hhRes = await query(
      `SELECT 
         t.task_type,
         t.nature,
         t.category,
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

    const hhPreventivoBreakdown = {};
    const hhVariosBreakdown = {};
    const hhAusentismoBreakdown = {};

    const PREVENTIVE_PATTERNS = [
      'preventivo', 'preventivos', 'condicional', 'semanal', 'mensual', 'trimestral', 'semestral', 'anual',
      'inspeccion', 'inspección', 'mejora', 'mejoras', 'montaje'
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
        disponibilidadH06: kpiH06 ? kpiH06.availability_pct : null,
        disponibilidadMediaREC01REC02: kpiMediaREC01REC02,
        disponibilidadMEP01: kpiMEP01 ? kpiMEP01.availability_pct : null,
        disponibilidadP04: kpiP04 ? kpiP04.availability_pct : null,
        menorDisponibilidadPuentesGruas: kpiMenorPuentesGruas,
        menorPuenteGruaNombre: kpiMenorPuenteGruaNombre,
        disponibilidadTR02: kpiTR02 ? kpiTR02.availability_pct : null,
        disponibilidadTR03: kpiTR03 ? kpiTR03.availability_pct : null,
        disponibilidadTR04: kpiTR04 ? kpiTR04.availability_pct : null,
        disponibilidadDRUIDS01: kpiDRUIDS01 ? kpiDRUIDS01.availability_pct : null,
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
