import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function initTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS monthly_business_days (
      id SERIAL PRIMARY KEY,
      plant VARCHAR(50) NOT NULL,
      year_month VARCHAR(7) NOT NULL,
      business_days INT NOT NULL DEFAULT 20,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(plant, year_month)
    );
  `);
}

// Función auxiliar para calcular días hábiles por defecto (Lun-Vie) de un año-mes (YYYY-MM)
function getDefaultBusinessDays(yearMonthStr) {
  const [yearStr, monthStr] = yearMonthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-indexed

  if (isNaN(year) || isNaN(month)) return 20;

  const daysInMonth = new Date(year, month, 0).getDate();
  let count = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
  }
  return count;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const plant = searchParams.get('plant');
  const yearMonth = searchParams.get('yearMonth'); // 'YYYY-MM'

  if (!plant || !yearMonth) {
    return NextResponse.json({ error: 'Falta planta o fecha (yearMonth)' }, { status: 400 });
  }

  try {
    await initTable();
    const result = await query(
      'SELECT business_days FROM monthly_business_days WHERE plant = $1 AND year_month = $2',
      [plant, yearMonth]
    );

    if (result.rows.length > 0) {
      return NextResponse.json({ business_days: result.rows[0].business_days, is_custom: true });
    }

    // Si no existe, devolver valor por defecto
    const defaultDays = getDefaultBusinessDays(yearMonth);
    return NextResponse.json({ business_days: defaultDays, is_custom: false });
  } catch (error) {
    console.error('Error fetching business days:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initTable();
    const { plant, yearMonth, business_days } = await request.json();

    if (!plant || !yearMonth || business_days === undefined || business_days === null) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    const numDays = parseInt(business_days, 10);
    if (isNaN(numDays) || numDays < 0 || numDays > 31) {
      return NextResponse.json({ error: 'Cantidad de días inválida (0 - 31)' }, { status: 400 });
    }

    await query(`
      INSERT INTO monthly_business_days (plant, year_month, business_days, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (plant, year_month)
      DO UPDATE SET business_days = EXCLUDED.business_days, updated_at = CURRENT_TIMESTAMP;
    `, [plant, yearMonth, numDays]);

    return NextResponse.json({ success: true, message: 'Días hábiles guardados correctamente', business_days: numDays });
  } catch (error) {
    console.error('Error saving business days:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
