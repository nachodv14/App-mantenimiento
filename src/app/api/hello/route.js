import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Ejemplo: verificamos si podemos conectarnos y traer la fecha de la base de datos
    const result = await query('SELECT NOW() as currentTime;');
    
    return NextResponse.json({ 
      message: '¡Conectado exitosamente usando DATABASE_URL!', 
      databaseTime: result.rows[0].currenttime,
      status: 'success' 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      message: 'Error al conectar a la base de datos', 
      error: error.message,
      status: 'error' 
    }, { status: 500 });
  }
}
