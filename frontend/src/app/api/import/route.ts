import { NextRequest, NextResponse } from 'next/server';
import { processBatches } from '@/services/batchProcessor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { headers, rows } = body;

    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return NextResponse.json({ error: 'Headers are required' }, { status: 400 });
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Rows are required' }, { status: 400 });
    }

    if (rows.length > 5000) {
      return NextResponse.json({ error: 'Maximum 5000 rows per import' }, { status: 400 });
    }

    const result = await processBatches(headers, rows);

    return NextResponse.json({
      records: result.records,
      imported: result.records.length,
      skipped: result.skippedCount,
      errors: result.errors,
    });
  } catch (err) {
    console.error('Import error:', err);
    const message = err instanceof Error ? err.message : 'Import failed';
    if (message.includes('API_KEY') || message.includes('401')) {
      return NextResponse.json({ error: 'AI service configuration error. Check your API key.' }, { status: 500 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
