import { query } from '@/lib/db';

export async function runGoogleSheetsSync() {
  try {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) return { error: 'No URL configured' };

    const qPending = `
      SELECT t.*, m.name as machine_name, u.full_name as operator_name
      FROM tasks t
      LEFT JOIN machines m ON t.machine_id = m.id
      LEFT JOIN users u ON t.operator_id = u.id
      WHERE t.status = 'PENDING'
      ORDER BY t.created_at DESC
    `;
    const resPending = await query(qPending);

    const qApproved = `
      SELECT t.*, m.name as machine_name, u.full_name as operator_name
      FROM tasks t
      LEFT JOIN machines m ON t.machine_id = m.id
      LEFT JOIN users u ON t.operator_id = u.id
      WHERE t.status = 'APPROVED'
      ORDER BY t.created_at DESC
    `;
    const resApproved = await query(qApproved);

    const qMachines = `
      SELECT 
        mos.*, 
        TO_CHAR(mos.start_time AT TIME ZONE 'America/Argentina/Buenos_Aires', 'DD/MM/YYYY HH24:MI') as start_time_fmt,
        TO_CHAR(mos.resolved_at AT TIME ZONE 'America/Argentina/Buenos_Aires', 'DD/MM/YYYY HH24:MI') as resolved_at_fmt,
        m.name as machine_name, 
        m.sector,
        u.full_name as reporter_name
      FROM machines_out_of_service mos
      LEFT JOIN machines m ON mos.machine_id = m.id
      LEFT JOIN users u ON mos.reported_by = u.id
      ORDER BY mos.created_at DESC
    `;
    const resMachines = await query(qMachines);

    const qUsers = `SELECT id, full_name FROM users`;
    const resUsers = await query(qUsers);
    const usersDict = {};
    resUsers.rows.forEach(u => usersDict[u.id] = u.full_name);

    const formatTask = (t) => {
      let comps = [];
      try { 
        comps = typeof t.companions === 'string' ? JSON.parse(t.companions) : t.companions; 
        if (!comps) comps = [];
      } catch (e) { }
      const compStr = Array.isArray(comps) ? comps.map(c => usersDict[c] || c).join(', ') : '';

      const formatTime = (isoString) => {
        if (!isoString) return '';
        try {
          const d = new Date(isoString);
          return d.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch (e) { return isoString; }
      }

      const formatDateOnly = (dateString) => {
        if (!dateString) return '';
        try {
          const d = new Date(dateString);
          return d.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
        } catch (e) { return dateString; }
      }

      return [
        t.id,
        t.plant,
        formatDateOnly(t.task_date),
        t.shift,
        t.operator_name,
        compStr,
        t.start_time,
        t.end_time,
        Number(t.total_time_minutes) || 0,
        t.man_hours ? Number(parseFloat(t.man_hours).toFixed(2)) : 0,
        t.description,
        t.task_type,
        t.category || '',
        t.machine_name || '',
        t.nature || '',
        t.deviation || '',
        t.observaciones || t.recommendations || '',
        t.affects_availability ? 'SI' : 'NO',
        formatTime(t.start_out_time),
        formatTime(t.end_out_time),
        t.stop_time_minutes ? Number((t.stop_time_minutes / 60).toFixed(2)) : '',
        t.final_state || '',
        t.supervisor_obs || ''
      ];
    };

    const payload = {
      pendientes: resPending.rows.map(formatTask),
      aprobados: resApproved.rows.map(formatTask),
      maquinas: resMachines.rows.map(m => [
        m.machine_name,
        m.sector || '',
        m.reporter_name || '',
        m.start_time_fmt || '',
        m.resolved_at_fmt || '-',
        m.deviation || '',
        m.is_resolved ? 'Resuelto' : 'PARADA'
      ])
    };

    const response = await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      // mode: 'no-cors' no existe en Node, pero podemos usar redirect: 'manual'
      redirect: 'manual'
    });

    const textResp = await response.text();
    console.log("Respuesta de Google Apps Script (STATUS " + response.status + "):", textResp.substring(0, 500));

    if (textResp.includes("<!DOCTYPE html>") && textResp.includes("Acceso denegado")) {
      return { success: false, error: "Google Drive bloqueó el acceso al script. Verifica los permisos de 'Cualquier usuario'." };
    }

    if (response.status === 302 || response.status === 303 || response.ok) {
      return { success: true, result: "Sincronización enviada" };
    }
    
    return { success: false, error: textResp || `Error HTTP ${response.status}` };
  } catch (error) {
    console.error('Error background sync:', error);
    return { success: false, error: error.message };
  }
}
