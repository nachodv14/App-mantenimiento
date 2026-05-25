import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const result = await query(`SELECT * FROM machines ORDER BY plant ASC, sector ASC, name ASC`);
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.plant) return NextResponse.json({ error: 'Nombre y planta son obligatorios' }, { status: 400 });

    await query(`INSERT INTO machines (name, plant, sector, is_active) VALUES ($1, $2, $3, $4)`, [
      body.name, body.plant, body.sector || null, body.is_active !== false
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
