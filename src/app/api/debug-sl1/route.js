import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromMonth = searchParams.get('fromMonth') || '2026-07';
    const toMonth = searchParams.get('toMonth') || '2026-07';

    const startDateStr = `${fromMonth}-01`;
    const [yearStr, monthStr] = toMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const lastDayNum = new Date(year, month, 0).getDate();
    const endDateStr = `${toMonth}-${lastDayNum < 10 ? '0' + lastDayNum : lastDayNum}`;

    const res = await query(`
      SELECT 
        id, plant, task_date, operator_id, companions, start_time, end_time, 
        total_time_minutes, man_hours, description, task_type, nature, category, status
      FROM tasks
      WHERE status = 'APPROVED' AND plant = 'SL1'
        AND task_date >= $1 AND task_date <= $2
      ORDER BY task_date DESC, id DESC
    `, [startDateStr, endDateStr]);

    let sumManHours = 0;
    let sumClockHours = 0;

    const breakdown = res.rows.map(r => {
      const mh = parseFloat(r.man_hours || 0);
      const ch = (r.total_time_minutes || 0) / 60.0;
      sumManHours += mh;
      sumClockHours += ch;

      let comps = [];
      try { comps = typeof r.companions === 'string' ? JSON.parse(r.companions) : (r.companions || []); } catch(e){}

      return {
        id: r.id,
        date: r.task_date,
        task_type: r.task_type,
        nature: r.nature,
        category: r.category,
        total_time_minutes: r.total_time_minutes,
        clock_hours: parseFloat(ch.toFixed(2)),
        man_hours: parseFloat(mh.toFixed(2)),
        companionsCount: comps.length,
        description: r.description
      };
    });

    return NextResponse.json({
      count: res.rows.length,
      sumManHours: parseFloat(sumManHours.toFixed(2)),
      sumClockHours: parseFloat(sumClockHours.toFixed(2)),
      difference: parseFloat((sumManHours - sumClockHours).toFixed(2)),
      breakdown
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
