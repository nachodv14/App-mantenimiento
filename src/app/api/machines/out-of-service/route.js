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
      WHERE ($1 = 'ALL' OR mos.plant = $1)
      ORDER BY mos.created_at DESC
    `;
    const result = await query(q, [plant]);
    return NextResponse.json({ machines: result.rows });
  } catch (error) {
    console.error('Error fetching machines out of service:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
