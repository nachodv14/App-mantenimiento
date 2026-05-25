import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const ALLOWED_TABLES = ['plants', 'record_types', 'building_categories', 'nature_types', 'absence_reasons'];

export async function PUT(request, { params }) {
  const { table, id } = await params;
  if (!ALLOWED_TABLES.includes(table)) return NextResponse.json({ error: 'Tabla inválida' }, { status: 400 });

  try {
    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });

    await query(`UPDATE ${table} SET name = $1 WHERE id = $2`, [body.name, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { table, id } = await params;
  if (!ALLOWED_TABLES.includes(table)) return NextResponse.json({ error: 'Tabla inválida' }, { status: 400 });

  try {
    await query(`DELETE FROM ${table} WHERE id = $2`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
