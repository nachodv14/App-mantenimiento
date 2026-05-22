import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { username, password, full_name, role, plant, is_active } = data;

    if (password && password.trim() !== '') {
      const password_hash = await bcrypt.hash(password, 10);
      await query(`
        UPDATE users 
        SET username = $1, password_hash = $2, full_name = $3, role = $4, plant = $5, is_active = $6
        WHERE id = $7
      `, [username, password_hash, full_name, role, plant, is_active, id]);
    } else {
      await query(`
        UPDATE users 
        SET username = $1, full_name = $2, role = $3, plant = $4, is_active = $5
        WHERE id = $6
      `, [username, full_name, role, plant, is_active, id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ese nombre de usuario ya existe' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
