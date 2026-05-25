import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
    }

    // 1. Check if it's the Admin
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        user: { role: 'admin', full_name: 'Administrador Principal', username }
      });
    }

    // 2. Check in the users table using password_hash
    const result = await query('SELECT id, username, password_hash, full_name, role, plant, is_active FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return NextResponse.json({ error: 'Usuario inactivo. Contacte al administrador.' }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    const { password_hash, ...safeUser } = user;

    try {
      await query('UPDATE users SET last_login = $1 WHERE id = $2', [new Date().toISOString(), user.id]);
    } catch (e) {
      console.error("Error updating last_login:", e);
    }

    return NextResponse.json({ user: safeUser });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
