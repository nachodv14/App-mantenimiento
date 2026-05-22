import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const plant = searchParams.get('plant');

  if (!plant) {
    return NextResponse.json({ error: 'Planta requerida' }, { status: 400 });
  }

  try {
    // Si la planta del supervisor es 'ALL', ve todo, si no, filtra.
    // Usamos CAST para asegurar el matcheo UUID si fuera necesario, pero operator_id es string o uuid?
    const q = `
      SELECT t.*, o.full_name as operator_name, m.name as machine_name 
      FROM tasks t 
      LEFT JOIN operators o ON t.operator_id = o.id::text 
      LEFT JOIN machines m ON t.machine_id = m.id::text 
      WHERE ($1 = 'ALL' OR t.plant = $1) 
        AND t.status = 'PENDING' 
      ORDER BY t.created_at DESC
    `;
    const result = await query(q, [plant]);
    return NextResponse.json({ tasks: result.rows });
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
