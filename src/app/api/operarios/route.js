import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const plant = searchParams.get('plant');

  try {
    let result;
    if (plant) {
      result = await query('SELECT * FROM operators WHERE plant = $1 AND is_active = true ORDER BY full_name ASC;', [plant]);
    } else {
      result = await query('SELECT * FROM operators WHERE is_active = true ORDER BY full_name ASC;');
    }
    
    return NextResponse.json({ operators: result.rows, status: 'success' });
  } catch (error) {
    console.error('Error fetching operators:', error);
    return NextResponse.json({ 
      message: 'Error al obtener operarios', 
      error: error.message,
      status: 'error' 
    }, { status: 500 });
  }
}
