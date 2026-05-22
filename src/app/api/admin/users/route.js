import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await query('SELECT id, username, full_name, role, plant, is_active FROM users ORDER BY role, plant, full_name');
    return NextResponse.json({ users: res.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { username, password, full_name, role, plant } = data;

    if (!username || !password || !full_name || !role || !plant) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await query(`
      INSERT INTO users (username, password_hash, full_name, role, plant)
      VALUES ($1, $2, $3, $4, $5)
    `, [username, password_hash, full_name, role, plant]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ese nombre de usuario ya existe' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
