import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const plant = searchParams.get('plant');

  try {
    const machines = plant 
      ? await query('SELECT id, name, sector FROM machines WHERE plant = $1 AND is_active = true ORDER BY name ASC;', [plant])
      : { rows: [] };
      
    const recordTypes = await query('SELECT name FROM record_types ORDER BY id ASC;');
    const natureTypes = await query('SELECT name FROM nature_types ORDER BY id ASC;');
    const buildingCat = await query('SELECT name FROM building_categories ORDER BY id ASC;');
    const absenceReasons = await query('SELECT name FROM absence_reasons ORDER BY id ASC;');

    return NextResponse.json({
      machines: machines.rows,
      recordTypes: recordTypes.rows.map(r=>r.name),
      natureTypes: natureTypes.rows.map(r=>r.name),
      buildingCategories: buildingCat.rows.map(r=>r.name),
      absenceReasons: absenceReasons.rows.map(r=>r.name),
    });
  } catch (error) {
    console.error('Error fetching form data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
