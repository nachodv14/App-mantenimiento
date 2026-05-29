import { NextResponse } from 'next/server';
import { runGoogleSheetsSync } from '@/lib/syncSheets';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const plant = searchParams.get('plant');
  
  const result = await runGoogleSheetsSync(plant);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ success: true, result });
}
