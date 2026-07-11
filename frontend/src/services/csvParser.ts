import { parse } from 'csv-parse/sync';
import { ALLOWED_CRM_STATUSES, ALLOWED_DATA_SOURCES, CRM_FIELD_ORDER } from '../types/backend';

export function parseCSV(content: string, delimiter: string = ','): { headers: string[]; rows: Record<string, string>[] } {
  const raw = parse(content, {
    delimiter,
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
  });

  if (!raw || raw.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = Object.keys(raw[0] as Record<string, string>);
  const rows: Record<string, string>[] = raw.map((row: any) => {
    const cleaned: Record<string, string> = {};
    for (const key of headers) {
      cleaned[key] = (row[key] || '').trim();
    }
    return cleaned;
  });

  return { headers, rows };
}

export function validateAndCleanRecords(records: any[]): { records: any[]; skipped: number; errors: string[] } {
  const valid: any[] = [];
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];

    if (record === null) {
      skipped++;
      continue;
    }

    if (!record.email && !record.mobile_without_country_code) {
      skipped++;
      errors.push(`Row ${i + 1}: skipped - no email or phone number found`);
      continue;
    }

    if (record.crm_status && !ALLOWED_CRM_STATUSES.includes(record.crm_status as any)) {
      record.crm_status = null;
    }

    if (record.data_source && !ALLOWED_DATA_SOURCES.includes(record.data_source as any)) {
      record.data_source = null;
    }

    if (record.created_at) {
      const d = new Date(record.created_at);
      if (isNaN(d.getTime())) {
        record.created_at = null;
      }
    }

    const cleaned: any = {};
    for (const field of CRM_FIELD_ORDER) {
      const val = record[field];
      cleaned[field] = val === undefined || val === null ? null : String(val);
    }

    valid.push(cleaned);
  }

  return { records: valid, skipped, errors };
}
