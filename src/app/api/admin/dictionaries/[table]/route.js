import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const ALLOWED_TABLES = ['plants', 'record_types', 'building_categories', 'nature_types', 'absence_reasons'];

export async function GET(request, { params }) {
  const { table } = await params;
  if (!ALLOWED_TABLES.includes(table)) return NextResponse.json({ error: 'Tabla inválida' }, { status: 400 });

  try {
    const result = await query(`SELECT * FROM ${table} ORDER BY name ASC`);
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { table } = await params;
  if (!ALLOWED_TABLES.includes(table)) return NextResponse.json({ error: 'Tabla inválida' }, { status: 400 });

  try {
    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });

    await query(`INSERT INTO ${table} (name) VALUES ($1)`, [body.name]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
