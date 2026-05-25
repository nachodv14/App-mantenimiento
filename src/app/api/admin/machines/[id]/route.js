import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request, { params }) {
  const { id } = await params;

  try {
    const body = await request.json();
    if (!body.name || !body.plant) return NextResponse.json({ error: 'Nombre y planta son obligatorios' }, { status: 400 });

    await query(`UPDATE machines SET name = $1, plant = $2, sector = $3, is_active = $4 WHERE id = $5`, [
      body.name, body.plant, body.sector || null, body.is_active !== false, id
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

