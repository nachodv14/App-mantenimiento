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
    const limit = parseInt(searchParams.get('limit') || '500', 10);
    const q = `
      SELECT t.*, 
             FORMAT(t.task_date, 'dd/MM/yyyy') as task_date_fmt,
             FORMAT(t.start_time, 'HH:mm') as start_time_fmt,
             FORMAT(t.end_time, 'HH:mm') as end_time_fmt,
             o.full_name as operator_name, 
             m.name as machine_name 
      FROM tasks t 
      LEFT JOIN users o ON t.operator_id = o.id
      LEFT JOIN machines m ON t.machine_id = m.id
      WHERE ($1 = 'ALL' OR t.plant = $1)
      ORDER BY t.task_date DESC, t.created_at DESC
      LIMIT $2
    `;
    const result = await query(q, [plant, limit]);
    return NextResponse.json({ tasks: result.rows });
  } catch (error) {
    console.error('Error fetching history tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
