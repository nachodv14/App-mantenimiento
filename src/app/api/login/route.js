import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const result = await query(
      'SELECT id, username, plant FROM supervisors WHERE LOWER(username) = LOWER($1) AND password = $2',
      [username.trim(), password]
    );

    if (result.rows.length > 0) {
      return NextResponse.json({ success: true, user: result.rows[0] });
    } else {
      return NextResponse.json({ success: false, message: 'Credenciales incorrectas' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
