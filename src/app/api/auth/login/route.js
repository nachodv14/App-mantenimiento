import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
    }

    let userPayload = null;

    // Buscar en la base de datos
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
    userPayload = safeUser;

    try {
      await query('UPDATE users SET last_login = $1 WHERE id = $2', [new Date().toISOString(), user.id]);
    } catch (e) {
      console.error("Error updating last_login:", e);
    }

    // Generate JWT Token
    const token = await signToken(userPayload);

    const response = NextResponse.json({ user: userPayload });

    // Set HttpOnly Cookie
    response.cookies.set('mantenimiento_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12 // 12 hours
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
