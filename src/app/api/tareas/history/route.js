import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const plant = searchParams.get('plant');

  if (!plant) {
    return NextResponse.json({ error: 'Planta requerida' }, { status: 400 });
  }

  try {
    const q = `
      SELECT t.*, 
             TO_CHAR(t.task_date, 'DD/MM/YYYY') as task_date_fmt,
             TO_CHAR(t.start_time, 'HH24:MI') as start_time_fmt,
             TO_CHAR(t.end_time, 'HH24:MI') as end_time_fmt,
             o.full_name as operator_name, 
             m.name as machine_name 
      FROM tasks t 
      LEFT JOIN users o ON t.operator_id = o.id
      LEFT JOIN machines m ON t.machine_id = m.id
      WHERE ($1 = 'ALL' OR t.plant = $1)
      ORDER BY t.created_at DESC
      LIMIT 100
    `;
    const result = await query(q, [plant]);
    return NextResponse.json({ tasks: result.rows });
  } catch (error) {
    console.error('Error fetching history tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
