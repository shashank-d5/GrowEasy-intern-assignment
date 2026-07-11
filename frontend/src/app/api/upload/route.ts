import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/services/csvParser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const content = await file.text();
    const { headers, rows } = parseCSV(content);

    if (headers.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty or has no valid headers' }, { status: 400 });
    }

    return NextResponse.json({ headers, rows, totalRows: rows.length });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Invalid CSV format' }, { status: 400 });
  }
}
