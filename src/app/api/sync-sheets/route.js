import { NextResponse } from 'next/server';
import { runGoogleSheetsSync } from '@/lib/syncSheets';

export const dynamic = 'force-dynamic';

export async function POST() {
  const result = await runGoogleSheetsSync();
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ success: true, result });
}
