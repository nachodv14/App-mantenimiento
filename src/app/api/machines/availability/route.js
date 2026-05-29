import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const plant = searchParams.get('plant');

  try {
    if (!plant) {
      return NextResponse.json({ error: 'Falta especificar la planta' }, { status: 400 });
    }

    const result = await query(
      'SELECT id, name, sector, productive_start, productive_end FROM machines WHERE plant = $1 AND is_active = true ORDER BY sector ASC, name ASC;',
      [plant]
    );

    return NextResponse.json({ machines: result.rows });
  } catch (error) {
    console.error('Error fetching machine availability:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'Falta el ID de la máquina' }, { status: 400 });
    }

    await query(
      'UPDATE machines SET productive_start = $1, productive_end = $2 WHERE id = $3',
      [data.productive_start || null, data.productive_end || null, data.id]
    );

    return NextResponse.json({ success: true, message: 'Horario actualizado correctamente' });
  } catch (error) {
    console.error('Error updating machine availability:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
