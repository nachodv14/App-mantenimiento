import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT name FROM plants ORDER BY name ASC;');
    return NextResponse.json({ 
      plants: result.rows.map(r => r.name), 
      status: 'success' 
    });
  } catch (error) {
    console.error('Error fetching plants:', error);
    return NextResponse.json({ 
      message: 'Error al obtener plantas', 
      error: error.message,
      status: 'error' 
    }, { status: 500 });
  }
}
