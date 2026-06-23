import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function initTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS shift_configs (
      id SERIAL PRIMARY KEY,
      plant VARCHAR(50) NOT NULL,
      shift_name VARCHAR(50) NOT NULL,
      start_time VARCHAR(5) NOT NULL,
      end_time VARCHAR(5) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(plant, shift_name)
    );
  `);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const plant = searchParams.get('plant');

  if (!plant) {
    return NextResponse.json({ error: 'Planta requerida' }, { status: 400 });
  }

  try {
    await initTable();
    const result = await query(
      'SELECT shift_name, start_time, end_time FROM shift_configs WHERE plant = $1',
      [plant]
    );
    return NextResponse.json({ shifts: result.rows });
  } catch (error) {
    console.error('Error fetching shift configs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initTable();
    const { plant, shifts } = await request.json();

    if (!plant || !shifts || !Array.isArray(shifts)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // Upsert shifts
    for (const shift of shifts) {
      await query(`
        INSERT INTO shift_configs (plant, shift_name, start_time, end_time, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (plant, shift_name) 
        DO UPDATE SET start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, updated_at = CURRENT_TIMESTAMP;
      `, [plant, shift.shift_name, shift.start_time, shift.end_time]);
    }

    return NextResponse.json({ message: 'Configuración guardada correctamente' });
  } catch (error) {
    console.error('Error saving shift configs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
